(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ProfileEditModalCtrl', ProfileEditModalCtrl);

	ProfileEditModalCtrl.$inject = ['$scope', 'profiles', 'Profile'];

	function ProfileEditModalCtrl($scope, profiles, Profile) {
		var vm = this;

		// Variables
		vm.profile = null;
		vm.authState = 'login';
		vm.remoteState = 'idle';
		vm.noCloudAuth = false;

		// Private Variables

		// Functions
		//vm.loginToCloud = loginToCloud;
		//vm.registerInCloud = registerInCloud;
		//vm.changeAuthState = changeAuthState;

		activate();

		function activate() {
			if (profiles.current != null) {
				profiles.editing = new Profile(profiles.current);
				console.log("Orig: " + profiles.current.id + ", Copy: " + profiles.editing.id);
				console.log("Editing existing profile");
			} else {
				console.log("New Profile Being Created");
				profiles.editing = new Profile();
			}
			vm.profile = profiles.editing;

			if (!vm.profile.cloud.username) {
				vm.noCloudAuth = true;
			}

			console.log("Name: " + vm.profile.name + ", ID: " + vm.profile.id);
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
