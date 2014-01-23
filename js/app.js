angular.module('storyApp', [])

.value('storageNamespace',  'choosatron/stories/' )

.service('$storageEngine', StorageEngine)

.service('$storage', ['$storageEngine', 'storageNamespace', Storage])

.service('$autosave', ['$storage', AutoSave])

.controller('StoryCtrl', ['$scope', '$autosave', '$storage', 

function StoryCtrl($scope, $autosave, $storage) {

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
		$scope.stories  =  $storage.values();
	};

	$scope.select_story  =  function(story) {
		story           =  story instanceof Story ? story : new Story(story);
		$scope.story    =  story;
		$scope.passage  =  story.get_opening();
	};

	$scope.new_story  =  function() {
		$scope.story    = new Story();
		$scope.story.id = $storage.length() + 1;
		$scope.new_passage();
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
