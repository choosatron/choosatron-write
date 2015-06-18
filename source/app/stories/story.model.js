angular.module('storyApp.models')
.factory('Story', ['BaseModel', 'Passage',
function(BaseModel, Passage) {

	/// Story ///
	function Story(data) {
		this.published    =  false;
		this.title        =  '';
		this.subtitle     =  '';
		this.version      =  1.0;
		this.description  =  '';
		this.coverUrl     =  '';
		this.genre        =  '';
		this.author       =  '';
		this.credits      =  '';
		this.contact      =  '';
		this.passages     =  {};
		this.startId      =  '';

		//this.endingTags   = CDAM.Config.kEndingTags;

		BaseModel.call(this, data);
	}

	Story.methods = {
		getTitle: function () {
			return this.title || "Untitled Story";
		},

		getStartPsg: function() {
			if (this.startId.length > 0) {
				return this.passages[this.startId];
			}
			return false;
		},

		// Return a list of IDs for passages with no parents
		// and no child links.
		getOrphans: function() {
			var destinations = [];
			this.eachPassage(function(p) {
				destinations.concat(p.getDestinations());
			});
			var ophans = [];
			this.eachPassage(function(p) {
				if ((p.entrances.length === 0) &&
				    (p.getDestinations().length === 0)) {
					orphans.push(p);
				}
			});
			return orphans;
		},

		// Return a list of IDs for passages with no parents,
		// but at least one valid child link (not including Start).
		getParentless: function() {
			// TODO
		},

		// Return a list of IDs for passages that aren't exits,
		// but have missing child links (even w/ some valid links).
		getMissingLinks: function() {
			// TODO
		},

		getChoice: function(aId) {
			// TODO: Review
			var choice = null;
			this.passages.some(function(p) {
				var c = p.getChoice(aId);
				if (c) {
					choice = c;
					return true;
				}
				return false;
			});
			return choice;
		},

		linkEntrances: function(aPassage) {
			for (var pId in aPassage.entrances) {
				for (var cId in aPassage.entrances[pId]) {
					this.passages[pId].getChoice(cId).setDestination(aPassage.id);
				}
			}
		},

		linkChoices: function(aPassage) {
			for (var i = 0; i < aPassage.choices.length; i++) {
				this.linkChoice(aPassage, aPassage.choices[i]);
			}
		},

		linkChoice: function(aPassage, aChoice) {
			if (aChoice.hasDestination()) {
				this.passages[aChoice.destination].addEntrance(aPassage.id, aChoice.id);
			}
		},

		// Nagivate to all choice destinations and remove the
		// current passage id from it's list of entrances.
		unlinkChoices: function(aPassage) {
			for (var i = 0; i < aPassage.choices.length; i++) {
				this.unlinkChoice(aPassage, aPassage.choices[i]);
			}
		},

		unlinkChoice: function(aPassage, aChoice) {
			if (aChoice.hasDestination()) {
				this.passages[aChoice.destination].removeEntranceChoices(aPassage.id);
			}
		},

		unlinkSingleChoice: function(aPassage, aChoice) {
			if (aChoice.hasDestination()) {
				this.passages[aChoice.destination].removeEntranceChoice(aPassage.id, aChoice.id);
			}
		},

		unlinkEntrances: function(aPassage) {
			for (var entrance in aPassage.entrances) {
				for (var i = 0; i < this.passages[entrance].choices.length; i++) {
					if (this.passages[entrance].choices[i].destination === aPassage.id) {
						this.passages[entrance].choices[i].removeDestination();
					}
				}
			}
		},

		addPassage: function(aPassage) {
			// If it's the only passage, it is the start.
			if (this.passages.length === 0) {
				this.startId = aPassage.id;
				aPassage.isStart = true;
				console.log("No passages yet!");
			} else {
				// If the new passage is set to isStart,
				// make sure there isn't another isStart passage.
				if (aPassage.isStart === true) {
					if (this.startId.length > 0) {
						this.passages[this.startId].isStart = false;
						console.log("Old id: %s, new id: %s", this.startId, aPassage.id);
					}
					this.startId = aPassage.id;
				}
			}
			this.passages[aPassage.id] = aPassage;
			this.passages[aPassage.id].number = Object.keys(this.passages).length;

			return aPassage.id;
		},

		deletePassage: function(aId) {
			if (!this.passages) {
				return;
			}
			if (aId in this.passages) {
				this.unlinkChoices(this.passages[aId]);
				this.unlinkEntrances(this.passages[aId]);
				this.passages[aId].trashed = true;
				//delete this.passages[aId];
			} else {
				console.warning("deletePassage: Passage '%s' not found.", aId);
			}
		},

		getPassage: function(aId) {
			return this.passages[aId];
		},

		eachPassage: function(aCallback) {
			return this.each('passages', aCallback);
		},

		/*collectEntrances: function(aPassage) {
			// TODO: Review
			var entrances = [];
			this.eachPassage(function(p) {
				if (p.hasDestination(aPassage)) {
					entrances.push(p);
				}

				if (p.hasAppend(aPassage)) {
					entrances.push(p);
				}
			});
			return entrances;
		},*/

		// Gathers all of the commands used in the story
		// and returns an array
		collectCommands: function() {
			var cmds = [];
			function add(aCmd) {
				if (!aCmd.empty()) {
					cmds.push(aCmd);
				}
			}
			for (var id in this.passages) {
				for (var choice in this.passages[id].choices) {
					if (('undefined' !== typeof choice.condition) &&
					    (choice.condition !== null)) {
						cmds.push(choice.condition);
					}
					if (typeof choice.updates != 'undefined') {
						choice.updates.forEach(add);
					}
				}
			}

			/*this.eachPassage(function(p) {
				p.eachChoice(function(c) {
					add(c.condition);
					c.updates.forEach(add);
				});
			});*/
			console.debug('FOUND', cmds);
			return cmds;
		},

		loadPassages: function(aPassages) {
			//console.log("loadPassages");
			//console.log(aPassages);
			for (var id in aPassages) {
				this.passages[id] = new Passage(aPassages[id]);
				//console.log("Loading psg: %s", this.passages[id].id);
			}

			//console.log('start');
			//console.log(this.passages);
			//console.log('done');

			// TODO: Why do we need to call this?
			// Wouldn't the exitType string get saved like
			// everything else?
			//for (var eId in this.passages) {
				//this.passages[eId].calculateExitType();
			//}
		},

		generatePsgEntrances: function() {
			// For each passage...
			for (var findId in this.passages) {
				// Reset this passages entrances...
				this.passages[findId].entrances = {};
				// We'll iterate over every OTHER passages...
				for (var currentId in this.passages) {
					//if (this.passages[currentId].choices.length > 0) {
						for (var i = 0; i < this.passages[currentId].choices.length; i++) {
							if (this.passages[currentId].choices[i].hasDestination(findId)) {
								this.passages[findId].addEntrance(currentId, this.passages[currentId].choices[i].id);
							}
						}
					//}
				}
			}
		}
	};

	BaseModel.extend(Story, Story.methods);

	return Story;
}
]);
