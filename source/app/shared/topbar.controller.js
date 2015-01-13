(function() {
	'use strict';

	/**
	 *
	**/
	angular.module('storyApp.controllers')
		.controller('TopbarCtrl', TopbarCtrl);

	TopbarCtrl.$inject = ['$location', 'profiles', 'ngDialog'];
	function TopbarCtrl($location, profiles, ngDialog) {
		var vm = this;

		// Variables
		vm.profile = null;
		vm.location = $location;

		// Functions
		vm.editProfile = editProfile;
		vm.changeProfile = changeProfile;
		vm.checkShowStoriesMenu = checkShowStoriesMenu;

		activate();

		function activate() {
			vm.profile = profiles.current;
			if (vm.location.path() != '/profiles') {
				if (!vm.profile) {
					console.error("No profiles selected. Redirecting to ./profiles");
					return $location.path('/profiles');
				}
			} else {
				console.log("Meow!");
				//profiles.current = null;
			}
		}

		function editProfile() {
			ngDialog.openConfirm({
				template: 'templates/profile-edit-modal.view.html',
				controller: 'ProfileEditModalCtrl',
			}).then(function (profile) {
				console.log('Modal promise resolved. Value: ', profile);
				profiles.select(profile);
				vm.profile = profile;
			}, function (reason) {
				console.log('Modal promise rejected. Reason: ', reason);
				profiles.editing = null;
			});
		}

		function changeProfile() {
			vm.location.path('/profiles');
			// TODO: Call 'logout' for any work to be done on closing a profile.
			// null the current profile on logout completion (or approval if user input needed)
			// profiles.current.logout(); ???
			profiles.current = null;
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