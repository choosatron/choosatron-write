angular.module('storyApp.controllers')
.controller('PlaybackCtrl', ['$scope', '$location', '$selection', 

function PlaybackCtrl($scope, $location, $selection) {
	$scope.playback = null;
	$scope.story    = null;
	$scope.passage  = null;

	this.init  =  function() {
		$selection.watchStory($scope, startPlayback);
		$selection.watchPassage($scope);
	}

	function startPlayback(story) {
		$scope.playback = new Playback();
		$scope.passage  = $scope.playback.start(story);
	};

	$scope.show_stories_menu = function () {
		$selection.clear()
		.then(function() {$location.path('stories')});
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
		$selection.setPassage($scope.passage)
		.then(function() {$location.path('story');});
	};

	this.init();
}]);
