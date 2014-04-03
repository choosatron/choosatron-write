function PlaybackCtrl($scope, $location, $story, $passage) {
	$scope.playback = null;
	$scope.story    = null;
	$scope.passage  = null;

	this.init  =  function() {
		$story.change(setStory);
		setStory($story.get());
	}

	function setStory(story) {
		$scope.story = story;
		$scope.playback = new Playback();
		$scope.passage  = $scope.playback.start(story);
	};

	$scope.show_stories_menu = function () {
		$story.clear();
		$passage.clear();
		$location.path('stories');
	};

	$scope.select_choice = function(choice) {
		$scope.passage = $scope.playback.select(choice);
		$scope.playback.debug();
	};

	$scope.select_passage = function(passage) {
		$scope.passage = passage;
	};

	$scope.edit_story = function(story) {
		$passage.set($scope.passage);
		$location.path('story');
	};

	this.init();
};
