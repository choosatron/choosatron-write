angular.module('storyApp.models')
.factory('Passage', ['Model', 'Choice',
function(Model, Choice) {

	/// Passage ///
	function Passage(data) {
		this.number       = null;
		this.content      = '';
		this.choices      = [];
		this.opening      = false;
		this.value        = 0;
		this.ending_value = false; // Not an ending when === false
		this.trashed      = false;
		// Cheating and using a Choice for the append data struct so I can reuse a bunch of code
		this.append_link  = new Choice();

		Model.call(this, data);

		this.reinit();

		Passage.passages[this.id] = this;

		Object.defineProperty(this, "abbr", {
			get: function abbr() {return this.abbreviate(10);}
		});
	}

	Passage.abbrs = {};
	Passage.passages = {};

	Passage.methods = {
		// There is a problem where Choice/Append Paths may not be valid destinations until all Passages have been loaded because their IDs might not exist in Passage.passages until then.  This means that has_append() is returning false when Passages are loaded when the app first runs.  My solution for now was to call this method again for each Passage after all Passages have been loaded in Story.load_passages()
		reinit: function () {
			if (this.has_ending()) {
				this.exit_type = 'ending';

			} else if (this.has_append()) {
				this.exit_type = 'append'

			} else {
				this.exit_type = 'choices';
			}
		},

		get_content: function () {
			return this.content || "Unwritten Passage";
		},

		set_exit_type: function (exit_type) {
			this.ending_value = false;
			this.choices = [];
			this.append_link = new Choice();

			this.exit_type = exit_type;
		},

		exit_is_empty: function () {
			return (
				(this.exit_type == 'ending' && !this.has_ending())
				|| (this.exit_type == 'append' && !this.has_append())
				|| (this.exit_type == 'choices' && !this.has_choices())
			);
		},

		has_ending: function () {
			return (this.ending_value !== false);
		},

		has_append: function (passage) {
			if (passage) {
				return (this.append_link.has_destination(passage));
			}

			return (this.append_link && this.append_link.has_destination && this.append_link.has_destination());
		},

		has_choices: function () {
			return (this.choices && this.choices.length);
		},

		set_ending: function (val) {
			this.ending_value = val;
		},

		ending_type_name: function () {
			if (!this.has_ending()) {
				return '';
			}

			switch (this.ending_value) {
				case -2:
					return 'terrible';
				case -1:
					return 'bad';
				case 0:
					return 'neutral';
				case 1:
					return 'good';
				case 2:
					return 'great';
			}

			return '';
		},

		abbreviate: function(len) {
			var starter = this.content.replace(/[^a-zA-Z0-1]/g, '').substr(0, len).toLowerCase();
			var abbr = starter;
			var i = 1;
			while (Passage.abbrs[abbr] && Passage.abbrs[abbr] != this.id) {
				abbr = starter + (i++).toString(); 
			}
			Passage.abbrs[abbr] = this.id;
			return abbr;
		},

		add_choice: function(choice) {
			if (!this.choices.push) {
				this.choices = [];
			}
			this.choices.push(choice);
			return choice.id;
		},

		remove_choice: function(choice) {
			for (var i=0,c; c=this.choices[i]; i++) {
				if (c.id == choice.id) {
					this.choices.splice(i, 1);
					break;
				}
			}
		},

		get_choice: function(id) {
			if (!this.choices) {
				return null;
			}
			var choice = null;
			var found = this.choices.some(function(c) {
				if (c.id == id) {
					choice = c;
					return true;
				}
				return false;
			});
			if (!found && this.has_append() && this.append_link.id == id) {
				choice = this.append_link;
			}
			return choice;
		},

		has_destination: function(passage) {
			var has  =  false;
			this.each_choice( function( c ) {
				if ( c.has_destination( passage ) ) {
					has  =  true;
					return false;
				}
			} );
			return has;
		},

		get_destinations: function() {
			var ids = [];
			this.each_choice(function(c) {
				c.each_path(function(p) {
					if (ids.indexOf(p.destination) < 0) {
						ids.push(p.destination);
					}
				});
			});
			return ids;
		},

		get_passage_choice: function (passage) {
			var n = 1,
				matching_choice;

			this.each_choice(function (choice) {
				if (choice.has_destination(passage)) {
					matching_choice = n + '. ' + choice.get_content();
				}

				n++;
			});

			return matching_choice;
		},

		each_choice: function(callback) {
			return this.each('choices', callback);
		},

		load_choices: function(choices) {
			for (var i=0; i<choices.length; i++) {
				this.choices.push(new Choice(choices[i]));
			}
		},

		load_append_link: function (append_link) {
			this.append_link = new Choice(append_link);
		}
	};
	Model.extend(Passage, Passage.methods);

	return Passage;
}
]);
