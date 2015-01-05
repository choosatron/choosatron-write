angular.module('storyApp.controllers')
.controller('PlaybackCtrl', ['$scope', '$location', 'profiles', 'translators', 'Playback',

function PlaybackCtrl($scope, $location, profiles, translators, Playback) {
	$scope.playback = null;
	$scope.story    = null;
	$scope.passage  = null;

	profiles.load()
	.then(function() {
		var profile = profiles.current;
		var entry = profile.entries[0];
		translators.restore('json', entry.entry_id)
		.then(function(result) {
			$scope.story = result.story;
			$scope.playback = new Playback();
			$scope.passage = $scope.playback.start(result.story);
		});
	});

	$scope.show_stories_menu = function () {
		$location.path('stories');
	};

	$scope.clear_passage_search = function() {
		$scope.passage_search = '';
	};

	$scope.select_choice = function(choice) {
		$scope.passage = $scope.playback.select(choice);
		$scope.playback.debug();
	};

	$scope.select_passage = function(passage) {
		$selection.setPassage(passage);
	};

	$scope.edit_story = function(story) {
		// @todo: Select the passage being viewed
		$location.path('story');
	};
}]);
