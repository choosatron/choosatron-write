angular.module('storyApp', [])

.value('storiesNamespace',     'choosatron/stories/')
.value('preferencesNamespace', 'choosatron/preferences/')

.service('$file', ['$http', File])
.service('$storageEngine', ['$q', StorageEngine])

.service('$stories', ['$storageEngine', 'storiesNamespace', Storage])
.service('$autosave', ['$stories', AutoSave])
.service('$preferences', ['$storageEngine', 'preferencesNamespace', Storage])

.controller('StoryCtrl', ['$scope', '$autosave', '$stories', '$preferences', '$file',

function StoryCtrl($scope, $autosave, $stories, $preferences, $file) {

	$scope.alerts         =  [];
	$scope.stories        =  [];
	$scope.story          =  null;
	$scope.passage        =  null;
	$scope.picking        =  false;
	$scope.deleted        =  null;

	this.init  =  function() {
		$scope.load_stories();
		$autosave.watch($scope, 'story', function(s) {return s ? s.id : null}, function(s) {return s ? s.object() : null});
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
		$scope.deleted  =  { 
			type: "story",
			title: story.title,
			undo: function() {$scope.story = story;} 
		};
		$scope.story    =  null;
		$scope.passage  =  null;
		$stories.remove(story.id);

		var stories = [];
		angular.forEach($scope.stories, function(s, key) {
			if (s.id != story.id) stories.push(s);
		});
		$scope.stories = stories;
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
		$scope.passage = new Passage();
		$scope.story.add_passage($scope.passage);
		if (entrance_choice) {
			entrance_choice.set_destination($scope.passage);
		}
		$scope.picking = null;
	};

	$scope.pick_passage  =  function(choice) {
		$scope.picking = choice;
	};

	$scope.get_passage  =  function(id) {
		if (!$scope.story) return null;
		return $scope.story.get_passage(id);
	};

	$scope.edit_passage  =  function(id) {
		$scope.passage = $scope.story.get_passage(id);
		if ($scope.picking) {
			$scope.picking.set_destination($scope.passage);
			$scope.picking = null;
		}
	};

	$scope.delete_passage  =  function(passage) {
		$scope.deleted = {
			type: "passage",
			title: passage.content,
			undo: function() {
				$scope.story.add_passage(passage);
				$scope.passage = passage;
			}
		};
		$scope.story.delete_passage(passage.id);
		$scope.passage = $scope.story.get_opening();
	};

	$scope.new_choice  =  function(passage) {
		var choice  =  new Choice();
		passage.add_choice(choice);
	};

	$scope.has_destination  =  function(choice) {
		return choice.has_destination();
	}

	$scope.delete_choice  =  function(passage, choice) {
		$scope.deleted  =  {
			type: "choice", 
			title: choice.content,
			undo: function() {$scope.passage.add_choice(choice);}
		};
		passage.remove_choice(choice);
	}

	$scope.clear_passage_search  =  function() {
		$scope.passage_search = '';
	};

	$scope.undo_delete  =  function() {
		if (!$scope.deleted) return;
		$scope.deleted.undo();
		$scope.deleted = null;
	};

	$scope.json_story  =  function(pretty) {
		if (!$scope.story) return '{}';
		return $scope.story.serialize(pretty);
	};

	$scope.export_story  =  function(story) {
		$file.export(story.title + '.json', story.serialize(), 'json');
	}

	$scope.upload_story  =  function() {
		if ($scope.upload.text) {
			var data = angular.fromJson($scope.upload.text);
			var story = new Story(data);
			story.refresh_id();
			$scope.select_story(story);
		}
		else if ($scope.upload.text) {
			$file.read($scope.upload.text, function(text) {
				var data = angular.fromJson(text);
				var story = new Story(data);
				story.refresh_id();
				$scope.select_story(story);
			});
		}
	}

	this.init();
}

]);
