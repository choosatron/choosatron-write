/**
 *¬This is the controller responsible for listing all of the stories that are available in local storage
**/
function StoriesCtrl($scope, $location, $selection, $autosave, $stories, $file) {

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

		var stories = [];
		angular.forEach($scope.stories, function(s, key) {
			if (s.id != story.id) stories.push(s);
		});
		$selection.clear();
		$scope.stories = stories;
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
		$file.export_file(story.title, 'json', story.serialize(), 'text/javascript');
	};

	$scope.export_story_choosatron  =  function (story) {

		// TODO: Convert story to binary here either directly via story object or via story.serialize() JSON

		// Create a binary unsigned byte view of 100 bytes.
		var buffer = new ArrayBuffer(100),
			byteView = new Uint8Array(buffer),
			uint16View = new Uint16Array(buffer),
			uint32View = new Uint32Array(buffer);

		// Set a few example byte values
		/*byteView[0] = 0;
		byteView[1] = 255;
		byteView[2] = 0xff;
		byteView[3] = 1;
		byteView[4] = 0x01;

		uint32View[2] = 0xffffffff;
		uint32View[3] = 0x01010101;
		uint32View[4] = 6000000;*/

		for (var i=0; i<uint32View.length; i++) {
  			uint32View[i] = i*2;
		}

		for (var i=0; i<uint16View.length; i++) {
  			console.log("Entry " + i + ": " + uint16View[i]);
  			uint16View[i] = i;
		}

		$file.export_file(story.title, 'cdam', buffer, 'application/octet-stream');
	};

	$scope.import_story  =  function() {
		if ($scope.import.text) {
			var data = angular.fromJson($scope.import.text);
			var story = new Story(data);
			story.refresh_id();
			$scope.edit_story(story);
		}
		else if ($scope.import.text) {
			$file.read($scope.import.text, function(text) {
				var data = angular.fromJson(text);
				var story = new Story(data);
				story.refresh_id();
				$scope.edit_story(story);
			});
		}
	}

	init();
}
