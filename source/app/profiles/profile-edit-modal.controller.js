(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ProfileEditModalCtrl', ProfileEditModalCtrl);

	ProfileEditModalCtrl.$inject = ['$scope', 'profiles', 'Profile', 'authService'];

	function ProfileEditModalCtrl($scope, profiles, Profile, authService) {
		var vm = this;

		// Variables
		vm.profile     = null;
		vm.editState = 'edit';
		vm.authStatus = authService.authStatus;
		vm.openCloudAuth = false;
		vm.headerText  = '';

		// Private Variables

		// Functions
		vm.setupCloudLink = setupCloudLink;
		vm.updateHeader = updateHeader;


		activate();

		function activate() {
			if (profiles.current) {
				profiles.editing = new Profile(profiles.current);
				profiles.editing.cloud = profiles.current.cloud;
				console.log("Orig: " + profiles.current.id + ", Copy: " + profiles.editing.id);
				console.log("Editing existing profile");
			} else {
				console.log("New Profile Being Created");
				profiles.editing = new Profile();
			}

			$scope.$watch('vm.authStatus.remoteState', onRemoteStateChange);

			vm.updateHeader();

			vm.profile = profiles.editing;

			console.log("Name: " + vm.profile.name + ", ID: " + vm.profile.id);
		}

		function setupCloudLink() {
			//vm.headerText = "Setup Cloud Account Link";
			vm.openCloudAuth = true;
			vm.editingState = 'cloud_link';
			vm.updateHeader();
			//vm.authLink.openCloudAuth = true;
		}

		function updateHeader() {
			console.log("updateHeader");
			if (vm.editState === 'cloud_link') {
				vm.headerText = "Setup Cloud Account Link";
			} else if (profiles.current) {
				vm.headerText = "Edit Your Profile";
			} else {
				vm.headerText = "Setup Your Profile";
			}
		}

		function onRemoteStateChange(aOldState, aNewState) {
			console.log("Remote state change");
			if ((vm.authStatus.remoteState === 'success') ||
			    (vm.authStatus.remoteState === 'error') ||
			    (vm.authStatus.remoteState === 'canceled')) {
				console.log("edit state");
				vm.editState = 'edit';
			}

			vm.updateHeader();
		}
	}

})();
