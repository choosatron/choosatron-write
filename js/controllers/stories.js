/**
 *¬This is the controller responsible for listing all of the stories that are available in local storage
**/
angular.module('storyApp.controllers')
.controller('StoriesCtrl',  ['$scope', '$location', '$profiles', '$file', '$translators', 'Story',
function StoriesCtrl($scope, $location, $profiles, $file, $translators, Story) {

	$scope.profile            = null;
	$scope.stories_sort       = 'title';
	$scope.stories_sort_desc  = false;
	$scope.translators        = $translators.all();

	$profiles.load().then(function() {
		if (!$profiles.current) {
			return $location.path('profiles');
		}
		$scope.profile = $profiles.current;
		console.debug($profiles);
	});

	$scope.sort_stories = function (sort) {
		if ($scope.stories_sort == sort) {
			$scope.stories_sort_desc = !$scope.stories_sort_desc;

		} else {
			$scope.stories_sort = sort;
			$scope.stories_sort_desc = false;
		}
	};

	$scope.new_story = function() {
		var story = new Story();
		var err = function(e) {
			console.error("Error creating story", e);
		};

		$file.create('json')
		.then(function(entry) {
			story.title = entry.name.substr(0, entry.name.lastIndexOf('.'));
			story.author = $profiles.current.name;

			$file.write(entry, story.serialize())
			.then(function(event) {
				var entryId = $file.getEntryId(entry);
				$scope.profile.add_entry(entryId, story);
				$profiles.save().then(function() {
					$location.path('story');
				}, err);
			}, err);
		}, err);
	};

	$scope.edit_story = function(entry) {
		$profiles.current.select_entry(entry);
		$profiles.save().then(function() {
			$location.path('story');
		});
	};

	$scope.delete_story  =  function(entry) {
		$profiles.current.remove_entry(entry);
		$profiles.save();
	};

	$scope.export_story = function(type, story) {
		$translators.export(type, story);
	};

	$scope.import_story  =  function(type) {
		$translators.import(type, function(story, entry) {
			if (!story || !entry) return;
			$scope.edit_story(entry);
		});
	}
}]);
