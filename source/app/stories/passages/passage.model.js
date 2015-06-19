angular.module('storyApp.models')
.factory('Passage', ['BaseModel', 'Choice',
function(BaseModel, Choice) {

	/// Passage ///
	function Passage(data) {
		this.number         = null;
		this.content        = '';
		this.choices        = [];
		this.entrances      = {};
		this.tags           = {};
		this.isStart        = false;
		this.isValid        = false;
		this.value          = 0;
		this.endingIndex    = false; // Not an ending when === false
		this.trashed        = false;
		this.exitType       = CDAM.Strings.kExitTypeChoices;
		// Cheating and using a Choice for the append data struct so I can reuse a bunch of code
		this.appendLink = null;

		BaseModel.call(this, data);

		//this.calculateExitType();

		Passage.passages[this.id] = this;

		Object.defineProperty(this, "abbr", {
			get: function abbr() {return this.abbreviate(10);}
		});
	}

	Passage.abbrs = {};
	Passage.passages = {};

	Passage.methods = {
		/*calculateExitType: function () {
			if (this.hasEnding()) {
				this.exitType = CDAM.Strings.kExitTypeEnding;

			} else if (this.hasAppend()) {
				this.exitType = CDAM.Strings.kExitTypeAppend;

			} else {
				this.exitType = CDAM.Strings.kExitTypeChoices;
			}
		},*/

		getContent: function() {
			return this.content || "Unwritten Passage";
		},

		setExitType: function(aExitType) {
			this.endingIndex = false;
			this.choices = [];
			this.appendLink = new Choice();

			this.exitType = aExitType;
		},

		// Check if the current exit type is populated.
		exitIsEmpty: function () {
			if (this.exitType == CDAM.Strings.kExitTypeEnding &&
			    !this.hasEnding()) {
				return true;
			}
			if (this.exitType == CDAM.Strings.kExitTypeAppend &&
			    !this.hasAppend()) {
				return true;
			}
			if (this.exitType == CDAM.Strings.kExitTypeChoices &&
			    !this.hasChoices()) {
				return true;
			}
			return false;
		},

		// True if ending tag isn't set, no information loss if switching
		// exit type.
		hasEnding: function() {
			return (this.endingIndex !== false);
		},

		hasAppend: function() {
			return (this.appendLink && this.appendLink.hasDestination && this.appendLink.hasDestination());
		},

		hasChoices: function() {
			return (this.choices && this.choices.length);
		},

		setEndingIndex: function(aIndex) {
			if (this.exitType === CDAM.Strings.kExitTypeEnding) {
				this.endingIndex = aIndex;
			}
		},

		endingTypeName: function () {
			if (!this.hasEnding()) {
				return '';
			}
			return CDAM.Config.kEndingTags.titles[this.endingIndex];
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

		addEntrance: function(aPassageId, aChoiceId) {
			if (this.entrances.hasOwnProperty(aPassageId)) {
				this.entrances[aPassageId].push(aChoiceId);
			} else {
				this.entrances[aPassageId] = [aChoiceId];
			}
		},

		removeEntranceChoice: function(aPassageId, aChoiceId) {
			if (this.entrances.hasOwnProperty(aPassageId)) {
				if (this.entrances[aPassageId].length === 1) {
					delete this.entrances[aPassageId];
				} else {
					var index = this.entrances[aPassageId].indexOf(aChoiceId);
					this.entrances[aPassageId].splice(index, 1);
				}
			}
		},

		removeEntranceChoices: function(aPassageId) {
			delete this.entrances[aPassageId];
		},

		addChoice: function(aChoice) {
			if (!this.choices.push) {
				this.choices = [];
			}
			this.choices.push(aChoice);
			return aChoice.id;
		},


		// Is this messy? Moved to story.model, passing in all passages
		// felt weird.
		/*// Nagivate to all choice destinations and remove the
		// current passage id from it's list of entrances.
		unlinkChoices: function(aPassages) {
			this.choices.forEach(function(choice) {
				unlinkChoice(aPassages, choice);
			});
		},

		unlinkChoice: function(aPassage, aChoice) {
			if (aChoice.hasDestination()) {
				aPassages[aChoice.destination].removeEntrance(this.id);
			}
		},

		linkChoice: function(aPassages, aChoice) {
			if (aChoice.hasDestination()) {
				aPassages[aChoice.destination].addEntrance(this.id);
			}
		},*/

		removeChoice: function(aChoice) {
			for (var i = 0; i < this.choices.length; i++) {
				var c = this.choices[i];
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

		// TODO: What if it has multiple destinations to the same place?
		// Does that matter?
		hasDestination: function(aId) {
			var has = false;
			this.eachChoice( function(c) {
				if (c.hasDestination(aId)) {
					has = true;
					return false;
				}
			});
			return has;
		},

		getDestinations: function() {
			var ids = [];
			this.eachChoice(function(c) {
				if (ids.indexOf(c.destination) < 0) {
					ids.push(p.destination);
				}
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

		loadAppendLink: function(aAppendLink) {
			this.appendLink = new Choice(aAppendLink);
		}
	};
	BaseModel.extend(Passage, Passage.methods);

	return Passage;
}
]);
