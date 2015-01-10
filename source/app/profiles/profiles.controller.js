(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ProfilesCtrl', ProfilesCtrl);

	ProfilesCtrl.$inject = ['$scope', '$location', 'profiles', 'Profile', 'ngDialog'];

	function ProfilesCtrl($scope, $location, profiles, Profile, ngDialog) {
		var vm = this;

		// Variables
		vm.location = $location;

		// Functions
		vm.showStoriesMenu = showStoriesMenu;
		vm.pickProfile = pickProfile;
		vm.editProfile = editProfile;

		activate();

		function activate() {
			profiles.load().then(function() {
				vm.profiles = profiles;
			});
		}

		function showStoriesMenu() {
			vm.location.path('stories');
		}

		function editProfile(aProfile) {
			ngDialog.openConfirm({
				template: 'templates/new-profile-modal.view.html',
				controller: 'NewProfileModalCtrl',
				data: aProfile
			}).then(function (profile) {
				console.log('Modal promise resolved. Value: ', profile);
				vm.profiles.select(profile);
			}, function (reason) {
				console.log('Modal promise rejected. Reason: ', reason);
			});
		}

		function pickProfile(aProfile) {
			vm.profiles.select(aProfile);
			vm.profiles.save();
		}
	}

})();
