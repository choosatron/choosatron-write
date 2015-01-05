(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ProfileCtrl', ProfileCtrl)
		.controller('ProfilesCtrl', ProfilesCtrl);

	ProfileCtrl.$inject = ['$location', 'profiles'];

	function ProfileCtrl($location, profiles) {
		var vm = this;

		vm.location = $location

		profiles.load().then(function() {
			vm.profiles = profiles;
		});

		vm.view = function() {
			$location.path('profiles');
		};
	}

	ProfilesCtrl.$inject = ['$scope', '$location', 'profiles', 'Profile', 'ngDialog'];

	function ProfilesCtrl($scope, $location, profiles, Profile, ngDialog) {
		var vm = this;

		// Variables
		vm.location = $location;
		vm.saveState = 'disk';

		// Functions
		vm.showStoriesMenu = showStoriesMenu;
		vm.newProfile = newProfile;
		vm.pickProfile = pickProfile;
		vm.saveProfile = saveProfile;
		vm.setHomePath = setHomePath;

		profiles.load().then(function() {
			vm.profiles = profiles;
			$scope.$watch('vm.profiles.current.name', function(n, o) {
				vm.saveState = 'save';
			});
		});

		function showStoriesMenu() {
			vm.location.path('stories');
		}

		function newProfile() {
			//var profile = new Profile();
			//vm.profiles.select(profile);

			//vm.newProfile = new Profile();
			/*ngDialog.open({
				template: 'templates/newProfileView.html',
				controller: 'NewProfileCtrl'
			});*/

			ngDialog.openConfirm({
				template: 'templates/newProfileModalView.html',
				controller: 'NewProfileModalCtrl'
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

		function saveProfile() {
			vm.profiles.save()
			.then(function() {
				vm.saveState = 'saved';
			});
		}

		function setHomePath() {
			// TODO

		}
	}

})();