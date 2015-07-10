(function() {
	'use strict';

	/**
	 * This is the controller responsible for talking with the Choosatron!
	**/
	angular.module('storyApp.controllers')
		.controller('ChoosatronCtrl', ChoosatronCtrl);


	ChoosatronCtrl.$inject = ['$location', 'profiles'];

	function ChoosatronCtrl($location, profiles) {
		var vm = this;

		vm.location = $location;

		profiles.load().then(function () {
			//vm.choosatrons = $profiles.current.choosatrons;

			/*var profile = $profiles.current;
			if (!profile) {
				console.error("No profiles selected. Redirecting to ./profiles");
				return $location.path('profiles');
			}

			var choosatrons = profile.choosatrons;
			if (!choosatrons || choosatrons.length == 0) {
				console.error("Profile has no Choosatrons. Redirecting to ./stories");
				return $location.path('stories');
			}*/

		});

		vm.view = function() {
			$location.path('/choosatron');
		};
	}
})();
