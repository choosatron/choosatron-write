(function() {
	'use strict';

	/**
	 * This is the controller responsible for talking with the Choosatron!
	**/
	angular.module('storyApp.controllers')
		.controller('ChoosatronCtrl', ChoosatronCtrl);


	ChoosatronCtrl.$inject = ['$location', 'Profiles', 'ChoosatronSerial', 'ChoosatronCloud'];

	function ChoosatronCtrl($location, Profiles, ChoosatronSerial, ChoosatronCloud) {
		var vm = this;

		// Variables
		vm.location = $location;
		vm.profiles = Profiles;
		vm.profile = null;
		vm.serial = null;
		vm.cloud = null;

		activate();

		function activate() {
			Profiles.load().then(function() {
				vm.profile = Profiles.current;
				if (!vm.profile) {
					console.error("No profiles selected. Redirecting to ./profiles");
					return $location.path('profiles');
				}

				vm.serial = new ChoosatronSerial();
				vm.cloud = new ChoosatronCloud(vm.profile.getCloudAuth().getToken());
				loadChoosatrons();
			});
		}

		//profiles.load().then(function () {
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

		//});

		vm.view = function() {
			$location.path('/choosatron');
		};
	}
})();