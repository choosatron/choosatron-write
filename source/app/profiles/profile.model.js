angular.module('storyApp.models')
.factory('Profile', ['BaseModel', 'Auth',
function(BaseModel, Auth) {
	function Profile(data) {
		this.created   = Date.now();
		this.name      = '';
		this.autosave  = true;
		this.currentChoosatron = null;

		// Cloud auth
		this.cloud = new Auth(data && data.cloud);

		// Access tokens for guest Choosatron access.
		this.guestAuth = {};

		// Saves data to associate with Choosatrons
		this.choosatrons = {};

		// Saves file entry references to a profiles stories
		this.entries = [];

		BaseModel.call(this, data);
	}

	Profile.methods = {

		selectChoosatron: function(aId) {
			this.currentChoosatron = aId;
		},

		currentChoosatron: function() {
			return this.choosatrons[this.currentChoosatron];
		},

		saveChoosatron: function(aChoosatron) {
			var choosatron = {
				id: aChoosatron.id
			};

			if (this.choosatrons[aChoosatron.id]) {
				choosatron = this.choosatrons[aChoosatron.id];
				console.debug("Updating existing choosatron", aChoosatron);
			} else {
				console.debug("Adding new choosatron", aChoosatron);
			}

			// Very shallow copy of the choosatron
			var types = ['string', 'number', 'boolean'];
			for (var key in aChoosatron) {
				var value = aChoosatron[key];
				var type = typeof(value);
				if (types.indexOf(type) < 0) continue;
				choosatron[key] = value;
			}

			this.choosatrons[aChoosatron.id] = choosatron;

			return choosatron;
		},

		getChoosatron: function(aId) {
			if (this.choosatrons[aId]) {
				return this.choosatrons[aId];
			}
		},

		// Add a new entry record
		saveEntry: function(aEntryId, aStory) {
			var entry = {
				entryId : aEntryId,
				id: aStory.id
			};

			var index = this.findEntryIndex(entry);

			if (index >= 0) {
				entry = this.entries[index];
				this.entries.splice(index, 1);
				console.debug("Updating existing entry", aEntryId, entry, aStory);
			} else {
				console.debug("Adding new entry", aEntryId, entry, aStory);
			}

			// Very shallow copy of the story
			var types = ['string', 'number', 'boolean'];
			for (var key in aStory) {
				var value = aStory[key];
				var type = typeof(value);
				if (types.indexOf(type) < 0) continue;
				entry[key] = value;
			}

			// Add to the beginning of the list
			this.entries.unshift(entry);

			return entry;
		},

		findEntryIndex: function(aEntry) {
			if (!aEntry) return -1;
			if (!this.entries || !this.entries.length) return -1;

			for (var i = 0; i < this.entries.length; i++) {
				var compared = this.entries[i];
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
			this.entries.splice(i, 1);
		},

		// Shifts an entry to the top of the queue for selection
		selectEntry: function(aEntry) {
			var i = this.findEntryIndex(aEntry);
			if (i < 0) {
				return null;
			}
			var selected = this.entries[i];
			this.entries.splice(i, 1);
			this.entries.unshift(selected);
			return selected;
		}
	};
	BaseModel.extend(Profile, Profile.methods);

	return Profile;
}
]);
