/**
 *¬This is the controller responsible for listing all of the stories that are available in local storage
**/
angular.module('storyApp.controllers')
.controller('StoriesCtrl',  ['$scope', '$location', '$selection', '$file', '$translators', 'Story',
function StoriesCtrl($scope, $location, $selection, $file, $translators, Story) {

	$scope.profile            = null;
	$scope.story              = null;
	$scope.passage            = null;
	$scope.stories_sort       = 'title';
	$scope.stories_sort_desc  = false;
	$scope.translators        = $translators.all();

	function init() {
		loadProfile().then(function() {
			$selection.getLastStoryId().then(loadStory);
			$selection.watchStory($scope);
			$selection.watchPassage($scope);
		});
	};

	function loadStory(storyId) {
		if (!storyId) return;
		$selection.getLastPassageId()
		.then(function(passageId) {
			$scope.edit_story(storyId, passageId);
		});
	};

	function loadProfile() {
		return $selection.getActiveProfile()
		.then(function(profile) {
			$scope.profile = profile;
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

	$scope.playback_story = function(story) {
		$selection.set(story, story.get_opening())
		.then(function() {
			$location.path('playback');
		});
	};

	$scope.restore_entry = function(entryId, passageId) {
		$file.restore(entryId)
		.then(function(file) {
			$file.read(file)
			.then(function(result) {
				var data = angular.fromJson(result);
				var story = new Story(data);
				var passage = passageId ? story.get_passage(passageId) : story.get_opening();
				$selection.set(story, passage)
				.then(function() {
					$location.path('story');
				});
			});
		});
	};

	$scope.edit_story = function(storyId, passageId) {
		// Find the story based on its id
		var entry = $scope.profile.entries.find(function(entry) {
			return entry.id == storyId;
		});

		if (!entry) {
			return;
		}
		restore_entry(entryId, passageId);
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

	$scope.export_story = function(type, story) {
		$translators.export(type, story);
	};

	$scope.import_story  =  function(type) {
		$translators.import(type, $scope.edit_story);
	}

	init();
}]);
