(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ProfileEditModalCtrl', ProfileEditModalCtrl);

	ProfileEditModalCtrl.$inject = ['$scope', 'profiles', 'Profile', 'authService'];

	function ProfileEditModalCtrl($scope, profiles, Profile, authService) {
		var vm = this;

		// Variables
		vm.profile     = null;
		vm.authStatus = authService.authStatus;
		/*vm.authLink = {
			openCloudAuth: false
		};*/
		vm.openCloudAuth = false;
		vm.headerText  = '';

		// Private Variables

		// Functions
		vm.setupCloudLink = setupCloudLink;
		vm.updateHeader = updateHeader;
		//vm.loginToCloud = loginToCloud;
		//vm.registerInCloud = registerInCloud;
		//vm.changeAuthState = changeAuthState;

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

			vm.updateHeader();

			vm.profile = profiles.editing;

			console.log("Name: " + vm.profile.name + ", ID: " + vm.profile.id);
		}

		function setupCloudLink() {
			//vm.headerText = "Setup Cloud Account Link";
			vm.openCloudAuth = true;
			//vm.authLink.openCloudAuth = true;
		}

		function updateHeader() {
			console.log("updateHeader");
			if (vm.openCloudAuth) {
				vm.headerText = "Setup Cloud Account Link";
			} else if (profiles.current) {
				vm.headerText = "Edit Your Profile";
			} else {
				vm.headerText = "Setup Your Profile";
			}
		}

		/*function onError(err) {
			$scope.$apply(function() {
				console.log('API call completed on promise fail: ', err);
				vm.error = err;
				vm.remoteState = 'idle';
			});
		}

		function loginToCloud() {
			console.log("Logging in to cloud");

			vm.remoteState = 'working';

			var onSuccess = function() {
				$scope.$apply(function() {
					console.log("Logged in.", vm.profile.cloud);
					vm.remoteState = 'success';
					vm.info = { message: "Logged in to the cloud!" };
				});
			};

			vm.profile.cloud.login(vm.password)
				.then(onSuccess)
				.catch(onError);
		}

		function registerInCloud() {
			console.log("Registering in cloud");

			vm.remoteState = 'working';

			var onSuccess = function() {
				$scope.$apply(function() {
					console.log("Registered", vm.profile.cloud);
					vm.remoteState = 'idle';
					vm.info = { message: "You've been registered in the cloud!" };
				});
			};

			vm.profile.cloud.register(vm.password)
				.then(onSuccess)
				.catch(onError);
		}

		function changeAuthState(aNewState) {
			vm.authState = aNewState;
		}*/
	}

})();
