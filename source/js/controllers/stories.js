/**
 *¬This is the controller responsible for listing all of the stories that are available in local storage
**/
angular.module('storyApp.controllers')
.controller('StoriesCtrl',  ['$scope', '$location', '$profiles', '$file', '$translators', 'Story',
function StoriesCtrl($scope, $location, $profiles, $file, $translators, Story) {

	$scope.profile            = null;
	$scope.stories_sort       = 'modified';
	$scope.stories_sort_desc  = true;
	$scope.exporters          = $translators.exporters();
	$scope.importers          = $translators.importers();

	$profiles.load().then(function() {
		if (!$profiles.current) {
			return $location.path('profiles');
		}
		$scope.profile = $profiles.current;
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
				$scope.profile.save_entry(entryId, story);
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

	$scope.delete_story = function(entry) {
		$profiles.current.remove_entry(entry);
		$profiles.save();
	};

	$scope.duplicate_story = function(entry) {
		var title = 'Copy of ' + entry.title;

		var copyOriginal = function(copy) {
			if (!copy) return;
			var copyId = $file.getEntryId(copy);

			$translators.restore('json', entry.entry_id)
			.then(function(result) {
				result.story.title = title;
				$profiles.current.save_entry(copyId, result.story);
				$file.write(copy, result.story.serialize())
				.then(function() {
					$profile.save();
				});
			});
		}

		$file.create('json', title)
		.then(copyOriginal);
	};

	$scope.export_story = function(type, story) {
		$translators.export(type, story);
	};

	$scope.import_story = function(type) {
		$translators.import(type)
		.then(function(result) {
			console.debug("Imported result", result);
			if (!result || !result.entry || !result.story) {
				return;
			}
			var story = result.story;

			// Get a new file to save to
			$file.create('json')
			.then(function(newFile) {
				if (!newFile) return;
				$file.write(newFile, story.serialize())
				.then(function() {
					var newFileId = $file.getEntryId(newFile);
					var entry = $profiles.current.save_entry(newFileId, story);
					$scope.edit_story(entry);
				});
			});
		});
	}
}]);
