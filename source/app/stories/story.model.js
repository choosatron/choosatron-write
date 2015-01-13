angular.module('storyApp.models')
.factory('Story', ['BaseModel', 'Passage',
function(BaseModel, Passage) {

	/// Story ///
	function Story(data) {
		this.lastPassageNumber = 0;

		this.created      =  Date.now();
		this.modified     =  Date.now();
		this.title        =  '';
		this.version      =  1.0;
		this.description  =  '';
		this.cover_url    =  '';
		this.genre        =  '';
		this.author       =  '';
		this.credit       =  '';
		this.passages     =  [];
		BaseModel.call(this, data);
	}

	Story.methods = {
		getTitle: function () {
			return this.title || "Untitled Story";
		},

		getNextPassageNumber: function () {
			return ++this.lastPassageNumber;
		},

		getOpening: function() {
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
			if (this.passages.length === 0) {
				aPassage.opening = true;
			}
			this.passages.push(aPassage);
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
			var passage = null;
			this.passages.some(function(p) {
				if (p.id == aId) {
					passage = p;
					return true;
				}
				return false;
			});
			return passage;
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
