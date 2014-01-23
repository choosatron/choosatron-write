angular.module('storyApp', [])

.value('storiesNamespace',     'choosatron/stories/')
.value('preferencesNamespace', 'choosatron/preferences/')

.service('$storageEngine', StorageEngine)
.service('$stories', ['$storageEngine', 'storiesNamespace', Storage])
.service('$preferences', ['$storageEngine', 'preferencesNamespace', Storage])
.service('$autosave', ['$stories', AutoSave])

.controller('StoryCtrl', ['$scope', '$autosave', '$stories', '$preferences', 

function StoryCtrl($scope, $autosave, $stories, $preferences) {

	$scope.story    =  null;
	$scope.stories  =  [];
	$scope.passage  =  null;

	this.init  =  function() {
		$scope.load_stories();
		$autosave.watch($scope, 'story', this.story_key);
	}

	this.story_key = function(story) {
		if (!story) return null;
		return story.id;
	};

	$scope.load_stories  =  function() {
		$scope.stories  =  $stories.values();
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
		story           =  story instanceof Story ? story : new Story(story);
		$scope.story    =  story;
		$scope.passage  =  story.get_opening();
	};

	$scope.new_story  =  function() {
		$scope.story    = new Story();
		$scope.story.id = $stories.length() + 1;
		$scope.new_passage();
		$scope.stories.push($scope.story);
	}

	$scope.new_passage  =  function(entrance_choice) {
		$scope.passage  =  new Passage();
		$scope.story.add_passage($scope.passage);
		if (entrance_choice) {
			entrance_choice.set_destination($scope.passage);
		}
	};

	$scope.edit_passage  =  function(passage) {
		$scope.passage  =  passage;
	};

	$scope.new_choice  =  function(passage) {
		var choice  =  new Choice();
		passage.add_choice(choice);
	};

	$scope.delete_choice  =  function(passage, choice) {
		passage.remove_choice(choice);
	}

	$scope.json_story  =  function() {
		return JSON.stringify($scope.story);
	};

	this.init();
}

]);
