(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ProfilesCtrl', ProfilesCtrl);

	ProfilesCtrl.$inject = ['$scope', '$location', 'profiles', 'Profile', 'ProfileEditModalService'];

	function ProfilesCtrl($scope, $location, profiles, Profile, ProfileEditModalService) {
		var vm = this;

		// Variables
		vm.location = $location;
		vm.profiles = null;

		// Functions
		vm.showStoriesMenu = showStoriesMenu;
		vm.pickProfile     = pickProfile;
		vm.newProfile      = newProfile;
		vm.editProfile     = editProfile;
		vm.removeProfile   = removeProfile;

		activate();

		function activate() {
			profiles.load().then(function() {
				vm.profiles = profiles;
				if (profiles.all.length === 1) {
					showStoriesMenu();
				}
			});
		}

		function showStoriesMenu() {
			vm.location.path('/stories');
		}

		function newProfile() {
			ProfileEditModalService.create()
			.then(function(profile) {
				console.log('Modal promise resolved. Value: ', profile);
				vm.profiles.editing = null;
			})
			.catch(function (reason) {
				console.log('Modal promise rejected. Reason: ', reason);
				vm.profiles.editing = null;
			});
		}

		function editProfile(aProfile) {
			ProfileEditModalService.edit(aProfile)
			.then(function(profile) {
				console.log('Modal promise resolved. Value: ', profile);
				vm.profiles.editing = null;
			})
			.catch(function (reason) {
				console.log('Modal promise rejected. Reason: ', reason);
				vm.profiles.editing = null;
			});
		}

		function pickProfile(aProfile) {
			console.log("Pick Profile");
			vm.profiles.select(aProfile);
			vm.location.path('/stories');
		}

		function removeProfile(aProfile) {
			vm.profiles.remove(aProfile);
		}
	}

})();
