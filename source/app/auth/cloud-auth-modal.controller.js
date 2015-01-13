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
		vm.remoteState = 'idle';

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

			vm.remoteState = 'working';

			var onSuccess = function() {
				$scope.$apply(function() {
					console.log("Cloud Auth Logged in.", vm.profile.cloud);
					vm.remoteState = 'success';
					vm.info = { message: "Logged in to the cloud!" };
				});
			};

			authService.login(profiles.editing.cloud, vm.password)
				.then(onSuccess)
				.catch(onError);

			/*vm.profile.cloud.login(vm.password)
				.then(onSuccess)
				.catch(onError);*/
		}

		function registerInCloud() {
			console.log("Registering in cloud");

			vm.remoteState = 'working';

			var onSuccess = function() {
				$scope.$apply(function() {
					console.log("Cloud Auth Registered", vm.profile.cloud);
					vm.remoteState = 'idle';
					vm.info = { message: "You've been registered in the cloud!" };
				});
			};

			authService.register(profiles.editing.cloud, vm.password)
				.then(onSuccess)
				.catch(onError);

			/*vm.profile.cloud.register(vm.password)
				.then(onSuccess)
				.catch(onError);*/
		}

		function changeAuthState(aNewState) {
			vm.authState = aNewState;
		}

		// Private Functions
		function onError(err) {
			$scope.$apply(function() {
				console.log('API call completed on promise fail: ', err);
				vm.error = err;
				vm.remoteState = 'idle';
			});
		}
	}

})();
