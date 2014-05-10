angular.module('storyApp.databridge')
.service('$selection', ['$story', '$passage', '$preferences', 'Profile', '$file', '$q', 
/**
 * Can be used to manage what is the current story and passage¬
 * Expects the $story and $passage to be Shared instances 
 * and the $preferences to be a Storage instance
 *
 * This service handles passing changes to the selected story and passage
 * between views, and saves the changes to the preferences storage.
**/
function Selection($story, $passage, $preferences, Profile, $file, $q) {
	var lastStoryKey = 'last_story_id';
	var lastPassageKey = 'last_passage_id';
	var lastProfileKey = 'last_profile_id';

	return {
		watchStory: function(scope, callback) {
			var setStory = function(story) {
				scope.story = story;
				if (callback) callback(story);
			};
			$story.on('set', setStory);
			$story.get(setStory);
		},

		watchPassage: function(scope, callback) {
			var setPassage = function(passage) {
				scope.passage = passage;
				if (callback) callback(passage);
			};
			$passage.on('set', setPassage);
			$passage.get(setPassage);
		},

		getProfiles: function() {
			return $preferences.get('profiles');
		},

		getActiveProfile: function() {
			var deferred = $q.defer();
			var self = this;

			$preferences.get(lastProfileKey)
			.then(function(activeId) {
				$preferences.get('profiles')
				.then(function(profiles) {
					profiles = profiles || {};
					var profile = new Profile();

					if (activeId && profiles[activeId]) {
						profile = profiles[activeId];
					}
					else if (profiles.length > 0) {
						profile = profiles[0];
					}

					self.setProfile(profile)
					.then(function() {
						return deferred.resolve(profile);
					});
				});
			});
			return deferred.promise;
		},

		setProfile: function(profile) {
			var deferred = $q.defer();

			return $preferences.get('profiles')
			.then(function(profiles) {

				if (!profiles) profiles = {};
				profiles[profile.id] = profile;

				$preferences.set('profiles', profiles)
				.then(function() {
					$preferences.set(lastProfileKey)
					.then(deferred.resolve);
				});
			});

			return deferred.promise;
		},

		getLastStoryId: function() {
			return $preferences.get(lastStoryKey);
		},

		getLastPassageId: function() {
			return $preferences.get(lastPassageKey);
		},

		set: function(story, passage) {
			var self = this;
			var setPassage = function() {
				self.setPassage(passage);
			};
			return this.setStory(story).then(setPassage);
		},

		setStory: function(story) {
			var id = story && story.id;
			return $preferences.set(lastStoryKey, id)
			.then(function() {$story.set(story)});
		},

		setPassage: function(passage) {
			var id = passage && passage.id;
			return $preferences.set(lastPassageKey, id)
			.then(function() {$passage.set(passage);});
		},

		clear: function() {
			var self = this;
			var next = function() {
				self.setStory(null);
			};
			return this.setPassage(null).then(next);
		},

		debug: function(msg) {
			console.log(msg, 'requesting preferences');
			$preferences.data().then(function(data) {
				console.log(msg, data);
			});
		}
	}
}]);
