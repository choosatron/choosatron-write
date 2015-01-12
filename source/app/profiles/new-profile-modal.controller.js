(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('NewProfileModalCtrl', NewProfileModalCtrl);

	NewProfileModalCtrl.$inject = ['$scope', 'Profile'];

	function NewProfileModalCtrl($scope, Profile) {
		var vm = this;

		// Variables
		vm.profile = $scope.ngDialogData || new Profile();
		vm.authState = 'login';
		vm.remoteState = 'idle';

		// Functions
		vm.loginToCloud = loginToCloud;
		vm.registerInCloud = registerInCloud;
		vm.changeAuthState = changeAuthState;

		function onError(err) {
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
		}
	}

})();
