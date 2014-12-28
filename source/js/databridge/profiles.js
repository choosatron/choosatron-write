angular.module('storyApp.databridge')
.service('$profiles', ['ChromeStorageEngine', 'Storage', 'Profile', '$q',
/**
 * Can be used to manage what is the current story and passage¬
 * and the $preferences to be a Storage instance
 *
 * This service handles passing changes to the selected story and passage
 * between views, and saves the changes to the preferences storage.
**/
function (LocalStorageEngine, Storage, Profile, $q) {

	var storageEngine = new LocalStorageEngine();
	var profileStorage = new Storage(storageEngine, 'choosatron');

	this.loaded = false;
	this.all = [];
	this.current = null;

	this.save = function() {
		return profileStorage.set('profiles', this.all);
	}

	this.select = function(profile) {
		// Look for the existing profile to update and shift
		for (var i=0; i < this.all.length; i++) {
			if (this.all[i].id != profile.id) {
				continue;
			}
			this.all.splice(i, 1);
		}

		this.all.unshift(profile);
		this.current = profile;
		return this.save();
	};

	this.load = function() {
		var deferred = $q.defer();

		if (this.loaded) {
			deferred.resolve();
			return deferred.promise;
		}

		var setAll = function(list) {
			if (!list) list = [];
			list.forEach(function(data, i) {
				list[i] = new Profile(data);
			});

			this.loaded = true;
			this.all = list;
			this.current = this.all[0];
			deferred.resolve(this);
		};

		profileStorage.get('profiles')
		.then(setAll.bind(this));
		return deferred.promise;
	};
}]);
