(function() {
	'use strict';

	/**
	 * This is the controller responsible for listing all of the stories that are available in local storage
	**/
	angular.module('storyApp.controllers')
		.controller('StoriesCtrl', StoriesCtrl);

	StoriesCtrl.$inject = ['$location', 'profiles', 'file', 'translators', 'Story'];
	function StoriesCtrl($location, profiles, file, translators, Story) {
		var vm = this;

		// Variables
		vm.profile            = null;
		vm.storiesSort        = 'modified';
		vm.storiesSortDesc    = true;
		vm.exporters          = translators.exporters();
		vm.importers          = translators.importers();
		vm.location           = $location;

		// Functions
		vm.sortStories = sortStories;
		vm.newStory = newStory;
		vm.editStory = editStory;
		vm.deleteStory = deleteStory;
		vm.duplicateStory = duplicateStory;
		vm.exportStory = exportStory;
		vm.importStory = importStory;

		profiles.load().then(function() {
			if (!profiles.current) {
				return $location.path('/profiles');
			}
			vm.profile = profiles.current;
		});

		function sortStories(aSort) {
			if (vm.storiesSort == aSort) {
				vm.storiesSortDesc = !vm.storiesSortDesc;

			} else {
				vm.storiesSort = aSort;
				vm.storiesSortDesc = false;
			}
		}

		function newStory() {
			var story = new Story();
			var err = function(e) {
				console.error("Error creating story", e);
			};

			file.create('json')
			.then(function(entry) {
				story.title = entry.name.substr(0, entry.name.lastIndexOf('.'));
				story.author = profiles.current.name;

				file.write(entry, story.serialize())
				.then(function(event) {
					var entryId = file.getEntryId(entry);
					vm.profile.saveEntry(entryId, story);
					profiles.save().then(function() {
						$location.path('/story');
					}, err);
				}, err);
			}, err);
		}

		function editStory(aEntry) {
			profiles.current.selectEntry(aEntry);
			profiles.save().then(function() {
				$location.path('/story');
			});
		}

		function deleteStory(aEntry) {
			profiles.current.removeEntry(aEntry);
			profiles.save();
		}

		function duplicateStory(aEntry) {
			var title = 'Copy of ' + aEntry.title;

			var copyOriginal = function(copy) {
				if (!copy) {
					return;
				}
				var copyId = file.getEntryId(copy);

				translators.restore('json', aEntry.entryId)
				.then(function(result) {
					result.story.title = title;
					file.write(copy, result.story.serialize())
					.then(function() {
						profiles.current.saveEntry(copyId, result.story);
						$location.path('/story');
					});
				});
			};

			file.create('json', title)
			.then(copyOriginal);
		}

		function exportStory(aType, aStory) {
			translators.export(aType, aStory);
		}

		function importStory(aType) {
			translators.import(aType)
			.then(function(result) {
				console.debug("Imported result", result);
				if (!result || !result.entry || !result.story) {
					return;
				}
				var story = result.story;

				// Get a new file to save to
				file.create('json')
				.then(function(newFile) {
					if (!newFile) return;
					file.write(newFile, story.serialize())
					.then(function() {
						var newFileId = file.getEntryId(newFile);
						var entry = profiles.current.saveEntry(newFileId, story);
						vm.editStory(entry);
					});
				});
			});
		}
	}

})();
