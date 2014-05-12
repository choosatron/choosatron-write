angular.module('storyApp.models')
.factory('Profile', ['Model',
function(Model) {
	function Profile(data) {
		this.name    = '';
		this.created = Date.now();

		// Saves file entry references to a profiles stories
		this.entries = [];

		Model.call(this, data);
	}

	Profile.methods = {
		// Add a new entry record
		save_entry: function(entryId, story) {
			var entry = {
				entry_id : entryId,
				id: story.id
			};

			var index = this.find_entry_index(entry);

			if (index >= 0) {
				entry = this.entries[index];
				this.entries.splice(index, 1);
				console.debug("Updating existing entry", entryId, entry, story);
			}
			else {
				console.debug("Adding new entry", entryId, entry, story);
			}

			// Very shallow copy of the story
			var types = ['string', 'number', 'boolean'];
			for (var key in story) {
				var value = story[key];
				var type = typeof(value);
				if (types.indexOf(type) < 0) continue;
				entry[key] = value;
			}

			// Add to the beginning of the list
			this.entries.unshift(entry);

			return entry;
		},

		find_entry_index: function(entry) {
			if (!entry) return -1;
			if (!this.entries || !this.entries.length) return -1;

			for (var i=0; i<this.entries.length; i++) {
				var compared = this.entries[i];
				if (compared.entry_id == entry.entry_id) {
					return i;
				}
				if (compared.id == entry.id) {
					return i;
				}
			}

			return -1;
		},

		// Removes an entry from the list
		remove_entry: function(entry) {
			var i = this.find_entry_index(entry);
			if (i < 0) return;
			this.entries.splice(i, 1);
		},

		// Shifts an entry to the top of the queue for selection
		select_entry: function(entry) {
			var i = this.find_entry_index(entry);
			if (i < 0) {
				return null;
			}
			var selected = this.entries[i];
			this.entries.splice(i, 1);
			this.entries.unshift(selected);
			return selected;
		}
	}
	Model.extend(Profile, Profile.methods);

	return Profile;
}
]);
