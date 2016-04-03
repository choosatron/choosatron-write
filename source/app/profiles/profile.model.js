angular.module('storyApp.models')
.factory('Profile', ['BaseModel', 'Auth', 'Choosatron',
function(BaseModel, Auth, Choosatron) {
	function Profile(aData) {
		this.data = {};

		/* Non Serialized */

		/* Serialized */
		// Cloud auth
		this.data.auth = new Auth();

		this.data.name = '';

		this.data.autosave  = true;

		// Access tokens for guest Choosatron access.
		this.data.guestAuth = {};

		// Saves data to associate with Choosatrons
		this.data.choosatrons = [];

		// Saves file entry references to a profiles stories
		this.data.entries = [];

		BaseModel.call(this, aData);
	}

	Profile.methods = {

		loadAuth: function(aData) {
			if (aData) {
				this.data.auth = new Auth(aData);
			}
		},

		loadChoosatrons: function(aData) {
			if (aData) {
				var length = aData.length;
				for (var i = 0; i < length; i++) {
					this.data.choosatrons.push(new Choosatron(aData[i]));
				}
			}
		},

		// Add a new entry record
		saveEntry: function(aEntryId, aStory) {
			var entry = {
				entryId : aEntryId,
				id: aStory.id()
			};

			var index = this.findEntryIndex(entry);

			if (index >= 0) {
				entry = this.data.entries[index];
				this.data.entries.splice(index, 1);
				console.debug("Updating existing entry", aEntryId, entry, aStory);
			} else {
				console.debug("Adding new entry", aEntryId, entry, aStory);
			}

			// Very shallow copy of the story
			var types = ['string', 'number', 'boolean'];
			for (var key in aStory.data) {
				var value = aStory.data[key];
				var type = typeof(value);
				if (types.indexOf(type) < 0) {
					continue;
				}
				entry[key] = value;
			}

			// Add to the beginning of the list
			this.data.entries.unshift(entry);
			this.wasModified();
			return entry;
		},

		findEntryIndex: function(aEntry) {
			if (!aEntry) {
				return -1;
			}
			if (!this.data.entries || !this.data.entries.length) {
				return -1;
			}

			for (var i = 0; i < this.data.entries.length; i++) {
				var compared = this.data.entries[i];
				if (compared.entryId == aEntry.entryId) {
					return i;
				}
				if (compared.id == aEntry.id) {
					return i;
				}
			}

			return -1;
		},

		// Removes an entry from the list
		removeEntry: function(aEntry) {
			var i = this.findEntryIndex(aEntry);
			if (i < 0) {
				return;
			}
			this.data.entries.splice(i, 1);
			this.wasModified();
		},

		// Shifts an entry to the top of the queue for selection
		selectEntry: function(aEntry) {
			var i = this.findEntryIndex(aEntry);
			if (i < 0) {
				return null;
			}
			var selected = this.data.entries[i];
			this.data.entries.splice(i, 1);
			this.data.entries.unshift(selected);
			return selected;
		},

		/* Getters / Setters */

		// Non Serialized //

		auth: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.auth = aValue;
				this.wasModified();
				return;
			}
			return this.data.auth;
		},

		// Serialized //

		name: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.name = aValue;
				this.wasModified();
				return;
			}
			return this.data.name;
		},

		autosave: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.autosave = aValue;
				this.wasModified();
				return;
			}
			return this.data.autosave;
		},

		guestAuth: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.guestAuth = aValue;
				this.wasModified();
				return;
			}
			return this.data.guestAuth;
		},

		choosatrons: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.choosatrons = aValue;
				this.wasModified();
				return;
			}
			return this.data.choosatrons;
		},

		getChoosatron: function(aDeviceId) {
			var length = this.data.choosatrons.length;
			for (var i = 0; i < length; i++) {
				if (this.data.choosatrons[i].deviceId() == aDeviceId) {
					return this.data.choosatrons[i];
				}
			}
			return null;
		},

		saveChoosatron: function(aChoosatron) {
			var length = this.data.choosatrons.length;
			for (var i = 0; i < length; i++) {
				if (this.data.choosatrons[i].deviceId() == aChoosatron.deviceId) {
					return false;
				}
			}
			this.data.choosatrons.push(aChoosatron);
			this.wasModified();
		},

		removeChoosatron: function(aDeviceId) {
			var length = this.data.choosatrons.length;
			for (var i = 0; i < length; i++) {
				if (this.data.choosatrons[i].deviceId() == aDeviceId) {
					this.data.choosatrons.splice(i, 1);
					return true;
				}
			}
			return false;
		},

		entries: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.entries = aValue;
				this.wasModified();
				return;
			}
			return this.data.entries;
		}

	};

	BaseModel.extend(Profile, Profile.methods);

	return Profile;
}
]);
