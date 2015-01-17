angular.module('storyApp.databridge')
.service('profiles', ['ChromeStorageEngine', 'Storage', 'Profile', '$q',
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
	this.editing = null;

	this.save = function() {
		return profileStorage.set('profiles', this.all);
	};

	this.select = function(aProfile) {
		this.add(aProfile);
		this.current = aProfile;
	};

	this.add = function(aProfile) {
		// Look for the existing profile to update and shift
		for (var i = 0; i < this.all.length; i++) {
			if (this.all[i].id == aProfile.id) {
				this.all.splice(i, 1);
				break;
			}
		}
		this.all.unshift(aProfile);
		return this.save();
	};

	this.remove = function(aProfile) {
		// Look for the existing profile to remove
		for (var i = 0; i < this.all.length; i++) {
			if (this.all[i].id == aProfile.id) {
				this.all.splice(i, 1);
				break;
			}
		}
		return this.save();
	};

	this.load = function() {
		var deferred = $q.defer();

		if (this.loaded) {
			deferred.resolve();
			return deferred.promise;
		}

		var setAll = function(aList) {
			if (!aList) {
				aList = [];
			}

			aList.forEach(function(data, i) {
				aList[i] = new Profile(data);
			});

			this.loaded = true;
			this.all = aList;
			// Only set the selected or 'current' profile if there is one.
			// Otherwise let the user select, or create a new profile.
			if (this.all.length == 1) {
				this.current = this.all[0];
			}
			deferred.resolve(this);
		};

		profileStorage.get('profiles')
		.then(setAll.bind(this));
		return deferred.promise;
	};
}]);
