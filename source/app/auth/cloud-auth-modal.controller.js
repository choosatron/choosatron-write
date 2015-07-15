(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('CloudAuthModalCtrl', CloudAuthModalCtrl);

	CloudAuthModalCtrl.$inject = ['$scope', 'Choosatrons', 'Profiles', 'authService'];

	function CloudAuthModalCtrl($scope, Choosatrons, Profiles, authService) {
		var vm = this;

		// Variables
		vm.profile = null;
		vm.cloudUsername = '';
		vm.authState = 'login';
		vm.authStatus = authService.authStatus;
		vm.info = null;
		vm.choosatrons = Choosatrons;

		// Functions
		vm.loginToCloud = loginToCloud;
		vm.registerInCloud = registerInCloud;
		vm.changeAuthState = changeAuthState;
		vm.cancelAuth = cancelAuth;

		activate();

		function activate() {
			vm.profile = Profiles.editing;
			vm.cloudUsername = vm.profile.getCloudAuth().username;
		}

		function loginToCloud() {
			console.log("Logging in to cloud");

			var onComplete = function() {
				if (vm.authStatus.status === 'error') {
					if (vm.authStatus.error) {
						console.log('API call completed on promise fail: ', vm.authStatus.error);
						vm.authStatus.error.message = 'Unable to login, try again later.';
					}
					console.log(authService.authStatus.remoteState);
				} else {
					console.log(authService.authStatus.remoteState);
					console.log("Cloud Auth Logged in.", vm.profile.getCloudAuth());
					vm.info = { message: "Logged in to the cloud!" };
				}
			};
			console.log(authService.authStatus.remoteState);
			authService.login(Profiles.editing.getCloudAuth(), vm.password)
				.then(onComplete);
			console.log(authService.authStatus.remoteState);
		}

		function registerInCloud() {
			console.log("Registering in cloud");

			var onComplete = function() {
				if (vm.authStatus.status === 'error') {
					if (vm.authStatus.error) {
						console.log('API call completed on promise fail: ', vm.authStatus.error);
						vm.authStatus.error.message = 'Unable to register, try again later.';
					}
					console.log(authService.authStatus.remoteState);
				} else {
					console.log("Cloud Auth Registered", vm.profile.cloud);
					vm.info = { message: "You've been registered in the cloud!" };
				}
			};

			authService.register(Profiles.editing.cloud, vm.password)
				.then(onComplete);
		}

		function changeAuthState(aNewState) {
			vm.authState = aNewState;
		}

		function cancelAuth() {
			console.log("cancel auth");
			authService.reset();
			$scope.$parent.vm.editState = 'edit';
		}

		// Private Functions
		/*function onError(err) {
			console.log(authService.authStatus.remoteState);
		}*/
	}

})();
