angular.module('storyApp', [])

.value('storiesNamespace',     'choosatron/stories/')
.value('preferencesNamespace', 'choosatron/preferences/')

.service('$storageEngine', ['$q', StorageEngine])

.service('$stories', ['$storageEngine', 'storiesNamespace', Storage])
.service('$autosave', ['$stories', AutoSave])
.service('$preferences', ['$storageEngine', 'preferencesNamespace', Storage])

.controller('StoryCtrl', ['$scope', '$autosave', '$stories', '$preferences',

function StoryCtrl($scope, $autosave, $stories, $preferences) {

	$scope.story          =  null;
	$scope.stories        =  [];
	$scope.passage        =  null;

	this.init  =  function() {
		$scope.load_stories();
		$autosave.watch($scope, 'story', function(s) {return s.id}, function(s) {return s.object()});
	}

	$scope.get_story  =  function(id) {
		if (!id) return null;
		for (var i=0, story; story = $scope.stories[i]; i++) {
			if (story.id == id) return story;
		}
		return null;
	};

	$scope.load_stories  =  function() {
		$stories.values().then(function(stories) {
			$scope.stories = [];
			var story = null;
			for (var i=0, data; data = stories[i]; i++) {
				story = new Story(data);
				$scope.stories.push(story);
			}
			$preferences.get('last_story_id').then(function(id) {
				if (!id) return;
				var story = $scope.get_story(id);
				if (story) $scope.select_story(story);
			});
		});
	};

	$scope.delete_story  =  function(story) {
		$stories.remove(story.id);
		$scope.load_stories();
		if ($scope.story && $scope.story.id == story.id) {
			$scope.story    =  null;
			$scope.passage  =  null;
		}
	};

	$scope.select_story  =  function(story) {
		$scope.story    =  story;
		$scope.passage  =  story ? story.get_opening() : null;
		$preferences.set('last_story_id', story ? story.id : null);
	};

	$scope.new_story  =  function() {
		var story    = new Story();
		$scope.story = story;
		$scope.new_passage();
		$scope.stories.push(story);
		$preferences.set('last_story_id', story.id);
	}

	$scope.new_passage  =  function(entrance_choice) {
		$scope.passage  =  new Passage();
		$scope.story.add_passage($scope.passage);
		if (entrance_choice) {
			entrance_choice.set_destination($scope.passage);
		}
	};

	$scope.edit_passage  =  function(id) {
		var passage  =  null;
		$scope.story.each_passage(function(p) {
			if (p.id == id) {
				passage = p;
				return false;
			}
		});
		if (passage) $scope.passage = passage;
	};

	$scope.new_choice  =  function(passage) {
		var choice  =  new Choice();
		passage.add_choice(choice);
	};

	$scope.has_destination  =  function(choice) {
		return choice.has_destination();
	}

	$scope.delete_choice  =  function(passage, choice) {
		passage.remove_choice(choice);
	}

	$scope.json_story  =  function() {
		if (!$scope.story) return '{}';
		return $scope.story.serialize();
	};

	this.init();
}

]);
