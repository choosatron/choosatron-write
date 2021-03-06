(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('TopbarCtrl', TopbarCtrl);

	TopbarCtrl.$inject = ['$location', 'Profiles', 'ProfileEditModalService', 'authService', 'manifest'];
	function TopbarCtrl($location, Profiles, ProfileEditModalService, authService, manifest) {
		var vm = this;

		// Variables
		vm.profile = null;
		vm.location = $location;
		vm.manifest = manifest;

		// Functions
		vm.editProfile = editProfile;
		vm.changeProfile = changeProfile;
		vm.checkShowStoriesMenu = checkShowStoriesMenu;

		activate();

		function activate() {
			vm.profile = Profiles.current;
			if (vm.location.path() != '/profiles') {
				if (!vm.profile) {
					console.error("No profiles selected. Redirecting to ./profiles");
					return $location.path('/profiles');
				}
			}
		}

		function editProfile() {
			ProfileEditModalService.edit(vm.profile)
			.then(function (profile) {
				console.log('Modal promise resolved. Value: ', profile);
				vm.profile = profile;
				Profiles.editing = null;
			}, function (reason) {
				console.log('Modal promise rejected. Reason: ', reason);
				Profiles.editing = null;
			});
		}

		function changeProfile() {
			vm.location.path('/profiles');
			//profiles.current = null;
			authService.logout();
		}

		function checkShowStoriesMenu() {
			if ((vm.location.path() != '/stories') &&
			    (vm.location.path() != '/profiles')) {
				return true;
			}
			return false;
		}
	}

})();
