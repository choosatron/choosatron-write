angular.module('storyApp.models')
.factory('Story', ['BaseModel', 'Passage',
function(BaseModel, Passage) {

	/// Story ///
	function Story(aData) {
		// Max lengths for Choosatron binaries.
		this.kMaxSizeAuthor = 48;
		this.kMaxSizeCredits = 80;
		this.kMaxSizeContact = 128;
		this.kMaxSizeTitle = 64;
		this.kMaxSizeSubtitle = 32;

		/* Non Serialized */
		this.lastPsgNumber = 0;

		/* Serialized */
		this.data.author        =  '';
		this.data.credits       =  '';
		this.data.contact       =  '';
		this.data.title         =  '';
		this.data.subtitle      =  '';
		this.data.description   =  '';
		this.data.publishedOn   =  null;
		this.data.version       =  {major:0, minor:0, revision:0};
		this.data.coverUrl      =  '';
		this.data.genre         =  '';
		this.data.startId       =  '';
		this.data.passages      =  {};

		//this.endingTags   = CDAM.Config.kEndingTags;

		BaseModel.call(this, aData);
	}

	Story.methods = {

		getNextPassageNumber: function() {
			return this.getLastPsgNumber() + 1;
		},

		getStartPsg: function() {
			if (Object.keys(this.getPassages()).length === 0) {
				this.addPassage(new Passage());
			}
			return this.getPassages()[this.getStartId()];
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
				if ((p.getEntrances().length === 0) &&
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
			this.getPassages().some(function(p) {
				var c = p.getChoiceById(aId);
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
				for (var cId in aPassage.getEntranceWithKey(pId)) {
					this.getPassage(pId).getChoiceById(cId).setDestination(aPassage.getId());
				}
			}
		},

		linkChoices: function(aPassage) {
			for (var i = 0; i < aPassage.getChoices().length; i++) {
				this.linkChoice(aPassage, aPassage.getChoiceAtIndex(i));
			}
		},

		linkChoice: function(aPassage, aChoice) {
			if (aChoice.hasDestination()) {
				this.getPassage(aChoice.getDestination()).addEntrance(aPassage.getId(), aChoice.getId());
			}
		},

		// Nagivate to all choice destinations and remove the
		// current passage id from it's list of entrances.
		unlinkChoices: function(aPassage) {
			for (var i = 0; i < aPassage.getChoices().length; i++) {
				this.unlinkChoice(aPassage, aPassage.getChoiceAtIndex(i));
			}
		},

		unlinkChoice: function(aPassage, aChoice) {
			if (aChoice.hasDestination()) {
				this.getPassages(aChoice.getDestination()).removeEntranceChoices(aPassage.getId());
			}
		},

		unlinkSingleChoice: function(aPassage, aChoice) {
			if (aChoice.hasDestination()) {
				this.getPassages(aChoice.getDestination()).removeEntranceChoice(aPassage.getId(), aChoice.getId());
			}
		},

		unlinkEntrances: function(aPassage) {
			for (var entrance in aPassage.getEntrances()) {
				for (var i = 0; i < this.getPassages(entrance).getChoices().length; i++) {
					if (this.getPassage(entrance).getChoiceByIndex(i).getDestination() === aPassage.getId()) {
						this.getPassage(entrance).getChoiceByIndex(i).setDestination();
					}
				}
			}
		},

		addPassage: function(aPassage) {
			// If it's the only passage, it is the start.
			if (Object.keys(this.getPassages()).length === 0) {
				this.setStartId(aPassage.getId());
				aPassage.setIsStart(true);
			} else {
				// If the new passage is set to isStart,
				// make sure there isn't another isStart passage.
				if (aPassage.isStart() === true) {
					if (this.getStartId().length > 0) {
						this.getPassage(this.getStartId()).setIsStart(false);
						console.log("Old id: %s, new id: %s", this.getStartId(), aPassage.getId());
					}
					this.setStartId(aPassage.getId());
				}
			}
			this.setPassage(aPassage.getId(), aPassage);
			this.getPassage(aPassage.getId()).setNumber(this.getNextPassageNumber());

			return aPassage.getId();
		},

		deletePassage: function(aId) {
			if (!this.getPassages()) {
				return;
			}
			if (aId in this.getPassages()) {
				this.unlinkChoices(this.getPassage(aId));
				this.unlinkEntrances(this.getPassage(aId));
				this.getPassage(aId).setTrashed(true);
				//delete this.getPassages()[aId];
			} else {
				console.warning("deletePassage: Passage '%s' not found.", aId);
			}
		},

		eachPassage: function(aCallback) {
			return this.each('data.passages', aCallback);
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
			for (var id in this.getPassages()) {
				for (var choice in this.getPassage(id).getChoices()) {
					if (('undefined' !== typeof choice.getCondition()) &&
					    (choice.getCondition() !== null)) {
						cmds.push(choice.getCondition());
					}
					if (typeof choice.updates != 'undefined') {
						choice.getUpdates().forEach(add);
					}
				}
			}
			console.debug('CMDS FOUND: ', cmds);
			return cmds;
		},

		loadPassages: function(aPassages) {
			for (var id in aPassages) {
				this.setPassage(id, new Passage(aPassages[id]));
			}

			// TODO: Why do we need to call this?
			// Wouldn't the exitType string get saved like
			// everything else?
			//for (var eId in this.getPassages()) {
				//this.getPassages()[eId].calculateExitType();
			//}
		},

		generatePsgEntrances: function() {
			// For each passage...
			for (var findId in this.getPassages()) {
				// Reset this passages entrances...
				this.getPassage(findId).setEntrances({});
				// We'll iterate over every OTHER passages...
				for (var currentId in this.getPassages()) {
					// Iterate over every choice in each passage...
					for (var i = 0; i < this.getPassage(currentId).getChoices().length; i++) {
						// If a choices destination is our 'findId' passage, create an entrance on 'findId'.
						if (this.getPassage(currentId).getChoiceByIndex(i).hasDestination(findId)) {
							// We keep track if multiple choices from one passage lead to the same destination.
							this.getPassage(findId).addEntrance(currentId, this.getPassage(currentId).getChoiceByIndex(i).getId());
						}
					}
				}
			}
		},

		/* Getters / Setters */

		getLastPsgNumber: function() {
			return this.lastPsgNumber;
		},

		setLastPsgNumber: function(aValue) {
			this.data.lastPsgNumber = aValue;
		},

		getAuthor: function() {
			return this.data.author;
		},

		// Has a max length, returns true if value was cutoff.
		setAuthor: function(aValue) {
			console.log(aValue);
			this.data.author = aValue.substr(0, this.kMaxSizeAuthor);
			this.wasModified();

			if (aValue.length > this.kMaxSizeAuthor) {
				return true;
			}
			return false;
		},

		getCredits: function() {
			return this.data.credits;
		},

		// Has a max length, returns true if value was cutoff.
		setCredits: function(aValue) {
			this.data.credits = aValue.substr(0, this.kMaxSizeCredits);
			this.wasModified();

			if (aValue.length > this.kMaxSizeCredits) {
				return true;
			}
			return false;
		},

		getContact: function() {
			return this.data.contact;
		},

		setContact: function(aValue) {
			this.data.contact = aValue.substr(0, this.kMaxSizeContact);
			this.wasModified();

			if (aValue.length > this.kMaxSizeContact) {
				return true;
			}
			return false;
		},

		getTitle: function() {
			return this.title || "Untitled Story";
		},

		// Has a max length, returns true if value was cutoff.
		setTitle: function(aValue) {
			this.data.title = aValue.substr(0, this.kMaxSizeTitle);
			this.wasModified();

			if (aValue.length > this.kMaxSizeTitle) {
				return true;
			}
			return false;
		},

		getSubtitle: function() {
			return this.data.subtitle;
		},

		// Has a max length, returns true if value was cutoff.
		setSubtitle: function(aValue) {
			this.data.subtitle = aValue.substr(0, this.kMaxSizeSubtitle);
			this.wasModified();

			if (aValue.length > this.kMaxSizeSubtitle) {
				return true;
			}
			return false;
		},

		getDescription: function() {
			return this.data.description;
		},

		setDescription: function(aValue) {
			this.data.description = aValue;
			this.wasModified();
		},

		getPublishedOn: function() {
			return this.data.publishedOn;
		},

		setPublishedOn: function(aValue) {
			this.data.publishedOn = aValue;
			this.wasModified();
		},

		setPublishedNow: function() {
			this.setPublishedOn(new Date());
		},

		getVersion: function() {
			return this.data.version;
		},

		getVersionStr: function() {
			var str = this.data.version.major + '.' +
			          this.data.version.minor + '.' +
			          this.data.version.revision;
			return str;
		},

		setVersion: function(aMajor, aMinor, aRevision) {
			if (typeof(aMajor) === 'number') {
				this.data.version.major = aMajor;
			}
			if (typeof(aMinor) === 'number') {
				this.data.version.minor = aMinor;
			}
			if (typeof(aRevision) === 'number') {
				this.data.version.revision = aRevision;
			}
			this.wasModified();
		},

		upMajorVersion: function() {
			this.data.version.major++;
			this.wasModified();
		},

		upMinorVersion: function() {
			this.data.version.minor++;
			this.wasModified();
		},

		upRevisionVersion: function() {
			console.log("Current Revision: %d", this.data.version.revision);
			this.data.version.revision++;
			console.log("New Revision: %d", this.data.version.revision);
			this.wasModified();
		},

		getCoverUrl: function() {
			return this.data.coverUrl;
		},

		setCoverUrl: function(aValue) {
			this.data.coverUrl = aValue;
			this.wasModified();
		},

		getGenre: function() {
			return this.data.genre;
		},

		setGenre: function(aValue) {
			this.data.genre = aValue;
			this.wasModified();
		},

		getStartId: function() {
			return this.data.startId;
		},

		setStartId: function(aValue) {
			this.data.startId = aValue;
			this.wasModified();
		},

		getPassages: function() {
			return this.data.passages;
		},

		getPassage: function(aKey) {
			return this.data.passages[key];
		},

		setPassage: function(aKey, aPassage) {
			this.data.passages[aKey] = aPassage;
			this.wasModified();
		}

	};

	BaseModel.extend(Story, Story.methods);

	return Story;
}
]);
