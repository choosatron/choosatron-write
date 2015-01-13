(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('CloudAuthModalCtrl', CloudAuthModalCtrl);

	CloudAuthModalCtrl.$inject = ['$scope', 'profiles', 'authService'];

	function CloudAuthModalCtrl($scope, profiles, authService) {
		var vm = this;

		// Variables
		vm.profile = null;
		vm.authState = 'login';
		vm.authStatus = authService.authStatus;
		vm.info = null;

		// Functions
		vm.loginToCloud = loginToCloud;
		vm.registerInCloud = registerInCloud;
		vm.changeAuthState = changeAuthState;

		activate();

		function activate() {
			vm.profile = profiles.current;
		}

		function loginToCloud() {
			console.log("Logging in to cloud");

			var onComplete = function() {
				$scope.$apply(function() {
					if (vm.authStatus.remoteState == 'error') {
						if (vm.authStatus.error) {
							console.log('API call completed on promise fail: ', vm.authStatus.error);
						}
						console.log(authService.authStatus.remoteState);
					} else {
						console.log(authService.authStatus.remoteState);
						console.log("Cloud Auth Logged in.", vm.profile.cloud);
						vm.info = { message: "Logged in to the cloud!" };
					}
				});
			};
			console.log(authService.authStatus.remoteState);
			authService.login(profiles.editing.cloud, vm.password)
				.then(onComplete);
			console.log(authService.authStatus.remoteState);
		}

		function registerInCloud() {
			console.log("Registering in cloud");

			var onComplete = function() {
				$scope.$apply(function() {
					if (vm.authStatus.remoteState == 'error') {
						if (vm.authStatus.error) {
							console.log('API call completed on promise fail: ', vm.authStatus.error);
						}
						console.log(authService.authStatus.remoteState);
					} else {
						console.log("Cloud Auth Registered", vm.profile.cloud);
						vm.info = { message: "You've been registered in the cloud!" };
					}
				});
			};

			authService.register(profiles.editing.cloud, vm.password)
				.then(onComplete);
		}

		function changeAuthState(aNewState) {
			vm.authState = aNewState;
		}

		// Private Functions
		/*function onError(err) {
			console.log(authService.authStatus.remoteState);
		}*/
	}

})();
