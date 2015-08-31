(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ProfileEditModalCtrl', ProfileEditModalCtrl);

	ProfileEditModalCtrl.$inject = ['$scope', 'Profiles', 'Profile', 'authService', 'Auth'];

	function ProfileEditModalCtrl($scope, Profiles, Profile, authService, Auth) {
		var vm = this;

		// Variables
		vm.profile = null;
		vm.editState = 'edit';
		vm.authStatus = authService.authStatus;
		vm.openCloudAuth = false;
		vm.headerText  = '';
		vm.profileName = '';
		vm.profileAutosave = false;

		// Private Variables

		// Functions
		vm.setupCloudLink = setupCloudLink;
		vm.updateHeader = updateHeader;
		vm.cancel = cancel;

		activate();

		function activate() {
			if (Profiles.current) {
				Profiles.editing = new Profile(Profiles.current);
				Profiles.editing.setCloudAuth(new Auth(Profiles.current.getCloudAuth()));
				console.log("Editing existing profile");
			} else {
				console.log("New Profile Being Created");
				Profiles.editing = new Profile();
			}

			$scope.$watch('vm.editState', onRemoteStatusChange);

			vm.profile = Profiles.editing;
			vm.profileName = vm.profile.getName();
			vm.profileAutosave = vm.profile.getAutosave();
		}

		function setupCloudLink() {
			vm.openCloudAuth = true;
			vm.editState = 'cloud_link';
		}

		function updateHeader() {
			console.log("updateHeader");
			if (vm.editState === 'cloud_link') {
				vm.headerText = "Setup Cloud Account Link";
			} else if (Profiles.current) {
				vm.headerText = "Edit Your Profile";
			} else {
				vm.headerText = "Setup Your Profile";
			}
		}

		function cancel() {
			Profiles.editing = null;
			$scope.closeThisDialog(0);
		}

		function onRemoteStatusChange(aNewStatus, aOldStatus) {
			/*console.log("Old status: " + aOldStatus + ", New Status: " + aNewStatus);
			if ((aOldStatus === 'ready') && (aNewStatus !== 'ready')) {
				vm.editState = 'edit';
				vm.openCloudAuth = false;
			}*/
			if (aOldStatus === 'cloud_link' && aNewStatus === 'edit') {
				vm.openCloudAuth = false;
			}

			vm.updateHeader();
		}
	}

})();
