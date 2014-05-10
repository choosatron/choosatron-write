angular.module('storyApp.models')
.factory('Profile', ['Model',
function(Model) {
	function Profile(data) {
		// The name of the person
		this.name = '';

		// Saves file entry references to a profiles stories
		this.entries = [];

		Model.call(this, data);
	}

	Profile.methods = {
		// Add a new entry record
		add_entry: function(entryId, story) {
			var entry = {
				entry_id : entryId,
			};

			// Very shallow copy of the story
			var types = ['string', 'number', 'boolean'];
			for (var key in story) {
				var value = story[key];
				var type = typeof(value);
				if (types.indexOf(type) < 0) continue;
				entry[key] = value;
			}

			// Add to the end of the list
			this.entries.push(entry);
		},

		remove_entry: function(entryId) {
			if (!this.entries) return;
			this.entries = this.entries.filter(function(entry) {
				return entry.entry_id != entryId;
			});
		}
	}
	Model.extend(Profile, Profile.methods);

	return Profile;
}
]);
