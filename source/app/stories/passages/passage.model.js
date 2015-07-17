angular.module('storyApp.models')
.factory('Passage', ['BaseModel', 'Choice',
function(BaseModel, Choice) {

	/// Passage ///
	function Passage(aData) {
		this.data = {};

		this.data.number         = null;
		this.data.content        = '';
		this.data.choices        = [];
		this.data.entrances      = {};
		this.data.tags           = {};
		this.data.isStart        = false;
		this.data.isValid        = false;
		this.data.value          = 0;
		this.data.endingIndex    = false; // Not an ending when === false
		this.data.exitType       = CDAM.Strings.kExitTypeChoices;
		this.data.trashed        = false;
		// Cheating and using a Choice for the append data struct so I can reuse a bunch of code
		//this.appendLink = null;

		BaseModel.call(this, aData);

		//this.calculateExitType();

		//Passage.passages[this.getId()] = this;
	}

	Passage.abbrs = {};
	//Passage.passages = {};

	Passage.methods = {
		/*calculateExitType: function () {
			if (this.hasEnding()) {
				this.setExitType(CDAM.Strings.kExitTypeEnding);

			} else if (this.hasAppend()) {
				this.setExitType(CDAM.Strings.kExitTypeAppend);

			} else {
				this.setExitType(CDAM.Strings.kExitTypeChoices);
			}
		},*/

		// Check if the current exit type is populated.
		exitIsEmpty: function () {
			if (this.getExitType() == CDAM.Strings.kExitTypeEnding &&
			    !this.hasEnding()) {
				return true;
			}
			if (this.getExitType() == CDAM.Strings.kExitTypeAppend &&
			    !this.hasAppend()) {
				return true;
			}
			if (this.getExitType() == CDAM.Strings.kExitTypeChoices &&
			    !this.hasChoices()) {
				return true;
			}
			return false;
		},

		// True if ending tag isn't set, no information loss if switching
		// exit type.
		hasEnding: function() {
			return (this.getEndingIndex() !== false);
		},

		hasAppend: function() {
			if (this.getExitType() == CDAM.Strings.kExitTypeAppend) {
				return (this.getChoiceAtIndex(0) && this.getChoiceAtIndex(0).hasDestination());
			}
			return false;
		},

		hasChoices: function() {
			return (this.getChoices() && this.getChoices().length);
		},

		endingTypeName: function () {
			if (!this.hasEnding()) {
				return '';
			}
			return CDAM.Config.kEndingTags.titles[this.getEndingIndex()];
		},

		abbreviate: function(aLength) {
			var starter = this.getContent();
			starter = starter.replace(/[^a-zA-Z0-1]/g, '').substr(0, aLength).toLowerCase();
			var abbr = starter;
			var i = 1;
			while (Passage.abbrs[abbr] && Passage.abbrs[abbr] != this.getId()) {
				abbr = starter + (i++).toString();
			}
			Passage.abbrs[abbr] = this.getId();
			return abbr;
		},

		addEntrance: function(aPassageId, aChoiceId) {
			if (this.data.entrances.hasOwnProperty(aPassageId)) {
				this.data.entrances[aPassageId].push(aChoiceId);
			} else {
				this.data.entrances[aPassageId] = [aChoiceId];
			}
		},

		removeEntranceChoice: function(aPassageId, aChoiceId) {
			if (this.data.entrances.hasOwnProperty(aPassageId)) {
				if (this.data.entrances[aPassageId].length === 1) {
					delete this.data.entrances[aPassageId];
				} else {
					var index = this.data.entrances[aPassageId].indexOf(aChoiceId);
					this.data.entrances[aPassageId].splice(index, 1);
				}
			}
		},

		removeEntranceChoices: function(aPassageId) {
			delete this.data.entrances[aPassageId];
		},

		addChoice: function(aChoice) {
			if (!this.data.choices) {
				this.data.choices = [];
			}
			this.data.choices.push(aChoice);
			return aChoice.getId();
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
				aPassages[aChoice.destination].removeEntrance(this.getId());
			}
		},

		linkChoice: function(aPassages, aChoice) {
			if (aChoice.hasDestination()) {
				aPassages[aChoice.destination].addEntrance(this.getId());
			}
		},*/

		removeChoice: function(aChoice) {
			for (var i = 0; i < this.getChoices().length; i++) {
				var c = this.getChoiceAtIndex(i);
				if (c.getId() == aChoice.getId()) {
					this.getChoices().splice(i, 1);
					break;
				}
			}
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
				if (ids.indexOf(c.getDestination()) < 0) {
					ids.push(p.getDestination());
				}
			});
			return ids;
		},

		getPassageChoice: function(aPassage) {
			var n = 1, matchingChoice;

			this.eachChoice(function (aChoice) {
				if (aChoice.hasDestination(aPassage.getId())) {
					matchingChoice = n + '. ' + aChoice.getContent();
				}

				n++;
			});

			return matchingChoice;
		},

		eachChoice: function(aCallback) {
			return this.each('data.choices', aCallback);
		},

		// Names for object loading use in BaseModel
		loadChoices: function(aChoices) {
			for (var i = 0; i < aChoices.length; i++) {
				this.getChoices().push(new Choice(aChoices[i]));
			}
		},

		// Named for objectifying use in BaseModel
		objectifyChoices: function(aChoices) {
			var o = [];

			for (var i = 0; i < aChoices.length; ++i) {
				o[i] = aChoices[i].object();
			}
			return o;
		},

		getAppendLink: function() {
			if (this.getExitType() == CDAM.Strings.kExitTypeAppend) {
				return this.data.choices[0];
			}
		},

		setAppendLink: function(aAppendLink) {
			if (this.getExitType() == CDAM.Strings.kExitTypeAppend) {
				this.data.choices[0] = new Choice(aAppendLink);
			} else {
				console.warn("Passage isn't an append type, can't set an append link.");
			}
		},

		/* Getters / Setters */

		// Non Serialized //

		getAbbreviation: function() {
			return this.abbreviate(10);
		},

		// Serialized //

		setId: function(aValue) {
			this.data.id = aValue;
		},

		getNumber: function() {
			return this.data.number;
		},

		setNumber: function(aValue) {
			this.data.number = aValue;
			this.wasModified();
		},

		content: function(aValue) {
			//console.log("getSetContent");
			if (angular.isDefined(aValue)) {
				console.log("set content");
				this.data.content = aValue;
				this.wasModified();
				return;
			}
			console.log("get content");
			return this.data.content;
		},

		getContent: function() {
			return this.data.content || "Unwritten Passage";
		},

		setContent: function(aValue) {
			this.data.content = aValue;
			this.wasModified();
		},

		getChoices: function() {
			return this.data.choices;
		},

		getChoiceAtIndex: function(aIndex) {
			return this.data.choices[aIndex];
		},

		getChoiceById: function(aId) {
			if (!this.data.choices) {
				return null;
			}
			var choice = null;
			var found = this.data.choices.some(function(c) {
				if (c.getId() == aId) {
					choice = c;
					return true;
				}
				return false;
			});
			return choice;
		},

		setChoices: function(aValue) {
			this.data.choices = aValue;
		},

		getEntrances: function() {
			return this.data.entrances;
		},

		getEntranceWithKey: function(aKey) {
			return this.data.entrances[aKey];
		},

		getTags: function() {
			return this.data.tags;
		},

		addTag: function(aKey, aValue) {
			this.data.tags[aKey] = aValue;
		},

		isStart: function() {
			return this.data.isStart;
		},

		setIsStart: function(aValue) {
			this.data.isStart = aValue;
			this.wasModified();
		},

		isValid: function() {
			return this.data.isValid;
		},

		setIsValid: function(aValue) {
			this.data.isValid = aValue;
			this.wasModified();
		},

		getEndingIndex: function() {
			return this.data.endingIndex;
		},

		setEndingIndex: function(aValue) {
			if (this.getExitType() === CDAM.Strings.kExitTypeEnding) {
				this.data.endingIndex = aValue;
				this.wasModified();
			}
		},

		getExitType: function() {
			return this.data.exitType;
		},

		setExitType: function(aValue) {
			this.data.endingIndex = false;
			this.data.choices = [];
			this.data.exitType = aValue;

			this.wasModified();
		},

		getTrashed: function() {
			return this.data.trashed;
		},

		setTrashed: function(aValue) {
			this.data.trashed = aValue;
			this.wasModified();
		}

	};
	BaseModel.extend(Passage, Passage.methods);

	return Passage;
}
]);
