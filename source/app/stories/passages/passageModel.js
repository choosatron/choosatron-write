angular.module('storyApp.models')
.factory('Passage', ['BaseModel', 'Choice',
function(BaseModel, Choice) {

	/// Passage ///
	function Passage(data) {
		this.number       = null;
		this.content      = '';
		this.choices      = [];
		this.opening      = false;
		this.value        = 0;
		this.endingValue  = false; // Not an ending when === false
		this.trashed      = false;
		// Cheating and using a Choice for the append data struct so I can reuse a bunch of code
		this.appendLink  = new Choice();

		BaseModel.call(this, data);

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
			if (this.hasEnding()) {
				this.exit_type = 'ending';

			} else if (this.hasAppend()) {
				this.exit_type = 'append'

			} else {
				this.exit_type = 'choices';
			}
		},

		getContent: function () {
			return this.content || "Unwritten Passage";
		},

		setExitType: function (aExitType) {
			this.endingValue = false;
			this.choices = [];
			this.appendLink = new Choice();

			this.exitType = aExitType;
		},

		exitIsEmpty: function () {
			return (
				(this.exitType == 'ending' && !this.hasEnding())
				|| (this.exitType == 'append' && !this.hasAppend())
				|| (this.exitType == 'choices' && !this.hasChoices())
			);
		},

		hasEnding: function () {
			return (this.endingValue !== false);
		},

		hasAppend: function (aPassage) {
			if (aPassage) {
				return (this.appendLink.hasDestination(aPassage));
			}

			return (this.appendLink && this.appendLink.hasDestination && this.appendLink.hasDestination());
		},

		hasChoices: function () {
			return (this.choices && this.choices.length);
		},

		setEnding: function (aValue) {
			this.endingValue = aValue;
		},

		endingTypeName: function () {
			if (!this.hasEnding()) {
				return '';
			}

			switch (this.endingValue) {
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

		abbreviate: function(aLength) {
			var starter = this.content.replace(/[^a-zA-Z0-1]/g, '').substr(0, aLength).toLowerCase();
			var abbr = starter;
			var i = 1;
			while (Passage.abbrs[abbr] && Passage.abbrs[abbr] != this.id) {
				abbr = starter + (i++).toString();
			}
			Passage.abbrs[abbr] = this.id;
			return abbr;
		},

		addChoice: function(aChoice) {
			if (!this.choices.push) {
				this.choices = [];
			}
			this.choices.push(aChoice);
			return aChoice.id;
		},

		removeChoice: function(aChoice) {
			for (var i = 0, c; c = this.choices[i]; i++) {
				if (c.id == aChoice.id) {
					this.choices.splice(i, 1);
					break;
				}
			}
		},

		getChoice: function(aId) {
			if (!this.choices) {
				return null;
			}
			var choice = null;
			var found = this.choices.some(function(c) {
				if (c.id == aId) {
					choice = c;
					return true;
				}
				return false;
			});
			if (!found && this.hasAppend() && this.appendLink.id == aId) {
				choice = this.appendLink;
			}
			return choice;
		},

		hasDestination: function(aPassage) {
			var has = false;
			this.eachChoice( function( c ) {
				if (c.hasDestination(aPassage)) {
					has = true;
					return false;
				}
			});
			return has;
		},

		getDestinations: function() {
			var ids = [];
			this.eachChoice(function(c) {
				c.eachPath(function(p) {
					if (ids.indexOf(p.destination) < 0) {
						ids.push(p.destination);
					}
				});
			});
			return ids;
		},

		getPassageChoice: function(aPassage) {
			var n = 1, matchingChoice;

			this.eachChoice(function (aChoice) {
				if (aChoice.hasDestination(aPassage)) {
					matchingChoice = n + '. ' + aChoice.getContent();
				}

				n++;
			});

			return matchingChoice;
		},

		eachChoice: function(aCallback) {
			return this.each('choices', aCallback);
		},

		loadChoices: function(aChoices) {
			for (var i = 0; i < aChoices.length; i++) {
				this.choices.push(new Choice(aChoices[i]));
			}
		},

		loadAppendLink: function (aAppendLink) {
			this.appendLink = new Choice(aAppendLink);
		}
	};
	BaseModel.extend(Passage, Passage.methods);

	return Passage;
}
]);
