(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('PlaybackCtrl', PlaybackCtrl);

	PlaybackCtrl.$inject = ['$location', 'profiles', 'translators', 'Playback'];

	function PlaybackCtrl($location, profiles, translators, Playback) {
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

		profiles.load()
		.then(function() {
			var profile = profiles.current;
			var entry = profile.entries[0];
			translators.restore('json', entry.entry_id)
			.then(function(result) {
				vm.story = result.story;
				vm.playback = new Playback();
				vm.passage = vm.playback.start(result.story);
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