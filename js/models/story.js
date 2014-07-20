angular.module('storyApp.models')
.factory('Story', ['Model', 'Passage', 
function(Model, Passage) {

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
		Model.call(this, data);
	}

	Story.methods = {
		get_title: function () {
			return this.title || "Untitled Story";
		},

		get_next_passage_number: function () {
			return ++this.lastPassageNumber;
		},

		get_opening: function() {
			var opening = null;
			this.each_passage(function(p) {
				if (p.opening) {
					opening = p;
					return false;
				}
			});
			// There should always be an opening. Make one if needed.
			if (!opening) {
				opening = new Passage();
				opening.opening = true;
				this.add_passage(opening);
			}
			return opening;
		},

		get_orphans: function() {
			var destinations = [];
			this.each_passage(function(p) {
				destinations.concat(p.get_destinations());
			});
			var ophans = [];
			this.each_passage(function(p) {
				if (destinations.indexOf(p.id) < 0) {
					orphans.push(p);
				}
			});
			return p;
		},

		get_choice: function(id) {
			var choice = null;
			this.passages.some(function(p) {
				var c = p.get_choice(id);
				if (c) {
					choice = c;
					return true;
				}
				return false;
			});
			return choice;
		},

		add_passage: function(passage) {
			if (this.passages.length == 0) {
				passage.opening = true;
			}
			this.passages.push(passage);
			return passage.id;
		},

		delete_passage: function(id) {
			if (!this.passages) return;
			for (var i=0; i<this.passages.length; i++) {
				if (this.passages[i].id == id) {
					// Delete entry from array
					this.passages[i].trashed = true;
					this.passages.splice(i, 1);
					break;
				}
			}
		},

		get_passage: function(id) {
			var passage = null;
			this.passages.some(function(p) {
				if (p.id == id) {
					passage = p;
					return true;
				}
				return false;
			});
			return passage;
		},

		each_passage: function(callback) {
			return this.each('passages', callback);
		},

		collect_entrances: function(passage) {
			var entrances = [];
			this.each_passage(function(p) {
				if (p.has_destination(passage)) {
					entrances.push(p);
				}

				if (p.has_append(passage)) {
					entrances.push(p);
				}
			});
			return entrances;
		},

		// Gathers all of the commands used in the story
		// and returns an array
		collect_commands: function() {
			var cmds = [];
			function add(cmd) {
				if (!cmd.empty()) {
					cmds.push(cmd);
				}
			};
			this.each_passage(function(p) {
				p.each_choice(function(c) {
					add(c.condition);
					c.updates.forEach(add);
				});
			});
			console.debug('FOUND', cmds);
			return cmds;
		},

		load_passages: function(passages) {
			var i;

			for (i = 0; i < passages.length; i++) {
				this.passages.push(new Passage(passages[i]));
			}

			// There is a problem where Choice/Append Paths may not be valid destinations until all Passages have been loaded because their IDs might not exist in Passage.passages until then.  This means that has_append() is returning false when Passages are loaded when the app first runs.  My solution for now was to call this method again for each Passage after all Passages have been loaded in Story.load_passages()
			for (i = 0; i < this.passages.length; i++) {
				this.passages[i].reinit();
			}
		}
	};
	Model.extend(Story, Story.methods);

	return Story;
}
]);
