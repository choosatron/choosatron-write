(function() {
	'use strict';

	/**
	 *
	**/
	angular.module('storyApp.controllers')
		.controller('TopbarCtrl', TopbarCtrl);

	TopbarCtrl.$inject = ['$location', 'profiles', 'ngDialog', 'authService'];
	function TopbarCtrl($location, profiles, ngDialog, authService) {
		var vm = this;

		// Variables
		vm.profile = null;
		vm.location = $location;
		vm.authStatus = authService.authStatus; // DEBUG: TODO - REMOVE

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
			}
		}

		function editProfile() {
			ngDialog.openConfirm({
				template: 'templates/profile-edit-modal.view.html',
				showClose: false,
				closeByEscape: false,
				preCloseCallback: function(value) {
					var nestedConfirmDialog = ngDialog.openConfirm({
						template: 'templates/modal-close-confirm.view.html',
						showClose: false,
						closeByEscape: false,
						plain: false
					});

					// NOTE: return the promise from openConfirm
					return nestedConfirmDialog;
				}
			}).then(function (profile) {
				console.log('Modal promise resolved. Value: ', profile);
				profiles.select(profile);
				vm.profile = profile;
				profiles.editing = null;
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