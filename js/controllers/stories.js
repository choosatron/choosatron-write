/**
 *¬This is the controller responsible for listing all of the stories that are available in local storage
**/
angular.module('storyApp.controllers')
.controller('StoriesCtrl',  ['$scope', '$location', '$selection', '$stories', '$file', '$translators', 'Story',
function StoriesCtrl($scope, $location, $selection, $stories, $file, $translators, Story) {

	$scope.stories            = [];
	$scope.story              = null;
	$scope.passage            = null;
	$scope.stories_sort       = 'title';
	$scope.stories_sort_desc  = false;

	function init() {
		loadStories().then(function() {
			$selection.getLastStoryId().then(loadStory);
			$selection.watchStory($scope);
			$selection.watchPassage($scope);
		});
	};

	function loadStory(storyId) {
		if (!storyId) return;
		var story = $scope.get_story(storyId);
		$scope.story = story;
		$selection.getLastPassageId().then(loadPassage);
	};

	function loadPassage(passageId) {
		if (!$scope.story) return;
		$scope.edit_story($scope.story, $scope.story.get_passage(passageId));
	};

	function loadStories() {
		return $stories.values().then(function(stories) {
			$scope.stories = [];
			var story = null;
			for (var i=0, data; data = stories[i]; i++) {
				story = new Story(data);
				$scope.stories.push(story);
			}
		});
	};

	$scope.sort_stories = function (sort) {
		if ($scope.stories_sort == sort) {
			$scope.stories_sort_desc = !$scope.stories_sort_desc;

		} else {
			$scope.stories_sort = sort;
			$scope.stories_sort_desc = false;
		}
	};

	$scope.get_story  =  function(id) {
		if (!id) return null;
		for (var i=0, story; story = $scope.stories[i]; i++) {
			if (story.id == id) return story;
		}
		return null;
	};

	$scope.playback_story = function(story) {
		$selection.set(story, story.get_opening())
		.then(function() {
			$location.path('playback');
		});
	};

	$scope.edit_story = function(story, passage) {
		$selection.set(story, story.get_opening())
		.then(function() {
			$location.path('story');
		});
	};

	$scope.delete_story  =  function(story) {
		$scope.deleted  =  {
			type: "story",
			title: story.title,
			undo: function() {$scope.story = story;}
		};

		$stories.remove(story.id).then(function() {
			$selection.clear();
		});

		var stories = [];
		$scope.stories = $scope.stories.filter(function(s) {
			return s.id != story.id;
		});
	};

	$scope.undo_delete  =  function() {
		if (!$scope.deleted) return;
		$scope.deleted.undo();
		$scope.deleted = null;
	};

	$scope.new_story = function() {
		$scope.edit_story(new Story());
	};

	$scope.export_story = function(story) {
		var json = $translators.get('json');
		var data = json.fromStory(story);
		$file.export(story.title, 'json', data, 'text/javascript');
	};

	$scope.export_story_choosatron  =  function (story) {
		var bin = $translators.get('bin');
		var buffer = bin.fromStory(story);
		$file.export(story.title, 'cdam', buffer, 'application/octet-stream');
	};

	$scope.import_story  =  function() {
		var supported = $translators.extensions();
		var read = function(text, entry, info) {
			var translator = $translators.getForFile(text, entry.name);
			var story = translator.toStory(text);
			story.refresh_id();
			$scope.edit_story(story);
		};
		$file.open(supported, read);
	}

	init();
}]);
