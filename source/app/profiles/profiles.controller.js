(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ProfilesCtrl', ProfilesCtrl);

	ProfilesCtrl.$inject = ['$scope', '$location', 'Profiles', 'Profile', 'ProfileEditModalService'];

	function ProfilesCtrl($scope, $location, Profiles, Profile, ProfileEditModalService) {
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
			Profiles.load().then(function() {
				vm.profiles = Profiles;
				if (Profiles.all.length === 1) {
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
				Profiles.editing = null;
			})
			.catch(function (reason) {
				console.log('Modal promise rejected. Reason: ', reason);
				Profiles.editing = null;
			});
		}

		function editProfile(aProfile) {
			ProfileEditModalService.edit(aProfile)
			.then(function(profile) {
				console.log('Modal promise resolved. Value: ', profile);
				Profiles.editing = null;
			})
			.catch(function (reason) {
				console.log('Modal promise rejected. Reason: ', reason);
				Profiles.editing = null;
			});
		}

		function pickProfile(aProfile) {
			console.log("Pick Profile");
			Profiles.select(aProfile);
			vm.location.path('/stories');
		}

		function removeProfile(aProfile) {
			Profiles.remove(aProfile);
		}
	}

})();
