(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ProfilesCtrl', ProfilesCtrl);

	ProfilesCtrl.$inject = ['$scope', '$location', 'profiles', 'Profile', 'ngDialog'];

	function ProfilesCtrl($scope, $location, profiles, Profile, ngDialog) {
		var vm = this;

		// Variables
		vm.location = $location;
		vm.profiles = null;

		// Functions
		vm.showStoriesMenu = showStoriesMenu;
		vm.pickProfile     = pickProfile;
		vm.newProfile      = newProfile;
		vm.removeProfile   = removeProfile;

		activate();

		function activate() {
			profiles.load().then(function() {
				vm.profiles = profiles;
			});
		}

		function showStoriesMenu() {
			vm.location.path('/stories');
		}

		function newProfile() {
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
				vm.profiles.add(profile);
				vm.profiles.editing = null;
			}, function (reason) {
				console.log('Modal promise rejected. Reason: ', reason);
				vm.profiles.editing = null;
			});
		}

		function pickProfile(aProfile) {
			console.log("Pick Profile");
			//vm.profiles.select(aProfile);
			vm.profiles.current = aProfile;
			vm.profiles.save();

			vm.location.path('/stories');
		}

		function removeProfile(aProfile) {
			vm.profiles.remove(aProfile);
		}
	}

})();
