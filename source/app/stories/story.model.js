angular.module('storyApp.models')
.factory('Story', ['BaseModel', 'Passage',
function(BaseModel, Passage) {

	/// Story ///
	function Story(data) {
		this.created      =  Date.now();
		this.modified     =  Date.now();
		this.published    =  false;
		this.title        =  '';
		this.subtitle     =  '';
		this.version      =  1.0;
		this.description  =  '';
		this.cover_url    =  '';
		this.genre        =  '';
		this.author       =  '';
		this.credits      =  '';
		this.contact      =  '';
		this.passages     =  {};
		this.startKey     =  '';
		BaseModel.call(this, data);
	}

	Story.methods = {
		getTitle: function () {
			return this.title || "Untitled Story";
		},

		getStartPsg: function() {
			var opening = null;
			this.eachPassage(function(p) {
				if (p.opening) {
					opening = p;
					return false;
				}
			});
			// There should always be an opening. Make one if needed.
			if (!opening) {
				opening = new Passage();
				opening.opening = true;
				opening.number = this.passages.length;
				this.addPassage(opening);
			}
			return opening;
		},

		getOrphans: function() {
			var destinations = [];
			this.eachPassage(function(p) {
				destinations.concat(p.getDestinations());
			});
			var ophans = [];
			this.eachPassage(function(p) {
				if (destinations.indexOf(p.id) < 0) {
					orphans.push(p);
				}
			});
			return p;
		},

		getChoice: function(aId) {
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

		addPassage: function(aPassage) {
			// If it's the only passage, it is the start.
			if (this.passages.length === 0) {
				aPassage.opening = true;
				this.passages.push(aPassage);
			} else {
				// If the new passage is set to opening,
				// make sure there isn't another opening passage.
				if (aPassage.opening === true) {
					this.eachPassage(function(p) {
						if (p.opening) {
							// If there is, unset it.
							p.opening = false;
							return;
						}
					});
					// Put the new start passage at the beginning.
					this.passages.unshift(aPassage);
				} else {
					// Just add the passage.
					this.passages.push(aPassage);
				}
			}

			/*this.eachPassage(function(p) {
				console.log(p.id);
			});*/
			return aPassage.id;
		},

		deletePassage: function(aId) {
			if (!this.passages) {
				return;
			}
			for (var i = 0; i < this.passages.length; i++) {
				if (this.passages[i].id == aId) {
					// Delete entry from array
					this.passages[i].trashed = true;
					this.passages.splice(i, 1);
					break;
				}
			}
		},

		getPassage: function(aId) {
			var index = this.getPassageIndex(aId);
			if (index >= 0) {
				return this.passages[index];
			}
			return null;
		},

		getPassageIndex: function(aId) {
			for (var i=0; i<this.passages.length; i++) {
				if (this.passages[i].id === aId) {
					return i;
				}
			}
			return false;
		},

		eachPassage: function(aCallback) {
			return this.each('passages', aCallback);
		},

		collectEntrances: function(aPassage) {
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
		},

		// Gathers all of the commands used in the story
		// and returns an array
		collectCommands: function() {
			var cmds = [];
			function add(cmd) {
				if (!cmd.empty()) {
					cmds.push(cmd);
				}
			}
			this.eachPassage(function(p) {
				p.eachChoice(function(c) {
					add(c.condition);
					c.updates.forEach(add);
				});
			});
			console.debug('FOUND', cmds);
			return cmds;
		},

		loadPassages: function(aPassages) {
			for (var i = 0; i < aPassages.length; i++) {
				this.passages.push(new Passage(aPassages[i]));
			}

			this.eachPassage(function(p) {
				p.calculateExitType();
			});
		}
	};

	BaseModel.extend(Story, Story.methods);

	return Story;
}
]);
