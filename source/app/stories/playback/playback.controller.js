(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('PlaybackCtrl', PlaybackCtrl);

	PlaybackCtrl.$inject = ['$location', 'Profiles', 'translators', 'Story', 'Playback'];

	function PlaybackCtrl($location, Profiles, translators, Story, Playback) {
		var vm = this;

		// Variables
		vm.playback = null;
		vm.story    = null;
		vm.passage  = null;

		// Functions
		vm.showStoriesMenu = showStoriesMenu;
		vm.clearPassageSearch = clearPassageSearch;
		vm.selectChoice = selectChoice;
		vm.selectPassage = selectPassage;
		vm.editStory = editStory;

		Profiles.load()
		.then(function() {
			var profile = Profiles.current;
			var entry = profile.getEntryAtIndex(0);
			translators.restore('json', entry.entryId)
			.then(function(result) {
				vm.story = new Story(result.story);
				vm.playback = new Playback();
				vm.passage = vm.playback.start(vm.story);
			});
		});

		function showStoriesMenu() {
			$location.path('/stories');
		}

		function clearPassageSearch() {
			vm.passage_search = '';
		}

		function selectChoice(aChoice) {
			vm.passage = vm.playback.select(aChoice);
			vm.playback.debug();
		}

		function selectPassage(aPassage) {
			vm.selection.setPassage(aPassage);
		}

		function editStory(aStory) {
			// @todo: Select the passage being viewed
			$location.path('/story');
		}
	}

})();
