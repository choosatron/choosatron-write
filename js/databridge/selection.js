angular.module('storyApp.databridge')
.service('$selection', ['$story', '$passage', '$preferences', 
/**
 * Can be used to manage what is the current story and passage¬
 * Expects the $story and $passage to be Shared instances 
 * and the $preferences to be a Storage instance
 *
 * This service handles passing changes to the selected story and passage
 * between views, and saves the changes to the preferences storage.
**/
function Selection($story, $passage, $preferences) {
	var storyKey = 'last_story_id';
	var passageKey = 'last_passage_id';
	var lastProfileKey = 'last_profile_id';
	var allProfilesKey = 'profiles';

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
			return $preferences.get(allProfilesKey);
		},

		setProfile: function(profile) {
			return this.getProfiles()
			.then(function(profiles) {
				if (!profile) return;
				if (!profiles) profiles = {};
				profiles[profile.id] = profile;
				profiles.activeId = profile.id;
			});
		},

		getLastStoryId: function() {
			return $preferences.get(storyKey);
		},

		getLastPassageId: function() {
			return $preferences.get(passageKey);
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
			return $preferences.set(storyKey, id)
			.then(function() {$story.set(story)});
		},

		setPassage: function(passage) {
			var id = passage && passage.id;
			return $preferences.set(passageKey, id)
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
