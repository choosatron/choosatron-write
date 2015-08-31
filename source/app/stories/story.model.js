angular.module('storyApp.models')
.factory('Story', ['BaseModel', 'Passage',
function(BaseModel, Passage) {

	/// Story ///
	function Story(aData) {
		this.data = {};

		// Max lengths for Choosatron binaries.
		this.kMaxSizeAuthor = 48;
		this.kMaxSizeCredits = 80;
		this.kMaxSizeContact = 128;
		this.kMaxSizeTitle = 64;
		this.kMaxSizeSubtitle = 32;

		/* Non Serialized */

		/* Serialized */
		this.data.opened        =  null;
		this.data.lastPsgNumber =  0;
		this.data.author        =  '';
		this.data.credits       =  '';
		this.data.contact       =  '';
		this.data.title         =  '';
		this.data.subtitle      =  '';
		this.data.description   =  '';
		this.data.published     =  null;
		this.data.version       =  {major:0, minor:0, revision:0};
		this.data.coverUrl      =  '';
		this.data.genre         =  '';
		this.data.startId       =  '';
		this.data.passages      =  {};

		//this.endingTags   = CDAM.Config.kEndingTags;

		BaseModel.call(this, aData);
	}


	/*Object.defineProperty(Story.prototype, "title", {
		get: function() {
			console.log("get title");
			return this.data.title || "Untitled Story";
		},
		set: function(aValue) {
			console.log("set title");
			this.data.title = aValue.substr(0, this.kMaxSizeTitle);
			this.wasModified();

			if (aValue.length > this.kMaxSizeTitle) {
				return true;
			}
			return false;
		}
	});*/

	Story.methods = {

		getNextPassageNumber: function() {
			this.setLastPsgNumber(this.getLastPsgNumber() + 1);
			return this.getLastPsgNumber();
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
					if (this.getPassage(entrance).getChoiceAtIndex(i).getDestination() === aPassage.getId()) {
						this.getPassage(entrance).getChoiceAtIndex(i).setDestination();
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
				console.log(id);
				console.log(this.getPassage(id).getChoices());
				for (var i = 0; i < this.getPassage(id).getChoices().length; ++i) {
					var choice = this.getPassage(id).getChoiceAtIndex(i);
					if (choice.getCondition()) {
					//if (('undefined' !== typeof choice.getCondition()) &&
					//    (choice.getCondition() !== null)) {
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

		// Named for object loading use in BaseModel
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

		// Named for objectifying use in BaseModel
		objectifyPassages: function(aPassages) {
			var o = {};

			for (var key in aPassages) {
				o[key] = aPassages[key].object();
			}
			return o;
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
						if (this.getPassage(currentId).getChoiceAtIndex(i).hasDestination(findId)) {
							// We keep track if multiple choices from one passage lead to the same destination.
							this.getPassage(findId).addEntrance(currentId, this.getPassage(currentId).getChoiceAtIndex(i).getId());
						}
					}
				}
			}
		},

		/* Getters / Setters */

		opened: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.opened = aValue;
				this.wasModified();
				return;
			}
			return this.data.opened;
		},


		getOpened: function() {
			return this.data.opened;
		},

		setOpened: function(aValue) {
			this.data.opened = aValue;
		},

		setOpenedNow: function() {
			this.data.opened = Date.now();
		},

		lastPsgNumber: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.lastPsgNumber = aValue;
				this.wasModified();
				return;
			}
			return this.data.lastPsgNumber;
		},

		getLastPsgNumber: function() {
			return this.data.lastPsgNumber;
		},

		setLastPsgNumber: function(aValue) {
			this.data.lastPsgNumber = aValue;
		},

		author: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.author = aValue.substr(0, this.kMaxSizeAuthor);
				this.wasModified();
				return;
			}
			return this.data.author;
		},


		getAuthor: function() {
			return this.data.author;
		},

		// Has a max length, returns true if value was cutoff.
		setAuthor: function(aValue) {
			this.data.author = aValue.substr(0, this.kMaxSizeAuthor);
			this.wasModified();

			if (aValue.length > this.kMaxSizeAuthor) {
				return true;
			}
			return false;
		},

		credits: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.credits = aValue.substr(0, this.kMaxSizeCredits);
				this.wasModified();
				return;
			}
			return this.data.credits;
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

		contact: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.contact = aValue.substr(0, this.kMaxSizeContact);
				this.wasModified();
				return;
			}
			return this.data.contact;
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

		/*get title() {
			console.log("get title");
			if (!this.data) {
				return;
			}
			return this.data.title || "Untitled Story";
		},

		set title(aValue) {
			console.log("set title");
			this.data.title = aValue.substr(0, this.kMaxSizeTitle);
			this.wasModified();

			if (aValue.length > this.kMaxSizeTitle) {
				return true;
			}
			return false;
		},*/

		title: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.title = aValue.substr(0, this.kMaxSizeTitle);
				this.wasModified();
				return;
			}
			return this.data.title;
		},

		getTitle: function() {
			console.log("getTitle", this);
			return this.data.title || "Untitled Story";
		},

		// Has a max length, returns true if value was cutoff.
		setTitle: function(aValue) {
			console.log("setTitle");
			this.data.title = aValue.substr(0, this.kMaxSizeTitle);
			this.wasModified();

			if (aValue.length > this.kMaxSizeTitle) {
				return true;
			}
			return false;
		},

		subtitle: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.subtitle = aValue.substr(0, this.kMaxSizeSubtitle);
				this.wasModified();
				return;
			}
			return this.data.subtitle;
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

		description: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.description = aValue;
				this.wasModified();
				return;
			}
			return this.data.description;
		},

		getDescription: function() {
			return this.data.description;
		},

		setDescription: function(aValue) {
			this.data.description = aValue;
			this.wasModified();
		},

		published: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.published = aValue;
				this.wasModified();
				return;
			}
			return this.data.published;
		},

		getPublished: function() {
			return this.data.published;
		},

		setPublished: function(aValue) {
			this.data.published = aValue;
			this.wasModified();
		},

		setPublishedNow: function() {
			this.setPublishedOn(new Date());
		},

		version: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.version = aValue;
				this.wasModified();
				return;
			}
			return this.data.version;
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

		coverUrl: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.coverUrl = aValue;
				this.wasModified();
				return;
			}
			return this.data.coverUrl;
		},

		getCoverUrl: function() {
			return this.data.coverUrl;
		},

		setCoverUrl: function(aValue) {
			this.data.coverUrl = aValue;
			this.wasModified();
		},

		genre: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.genre = aValue;
				this.wasModified();
				return;
			}
			return this.data.genre;
		},

		getGenre: function() {
			return this.data.genre;
		},

		setGenre: function(aValue) {
			this.data.genre = aValue;
			this.wasModified();
		},

		startId: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.startId = aValue;
				this.wasModified();
				return;
			}
			return this.data.startId;
		},

		getStartId: function() {
			return this.data.startId;
		},

		setStartId: function(aValue) {
			this.data.startId = aValue;
			this.wasModified();
		},

		passages: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.passages = aValue;
				this.wasModified();
				return;
			}
			return this.data.passages;
		},

		getPassages: function() {
			return this.data.passages;
		},

		getPassage: function(aKey) {
			return this.data.passages[aKey];
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
