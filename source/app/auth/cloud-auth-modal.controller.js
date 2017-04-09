(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('CloudAuthModalCtrl', CloudAuthModalCtrl);

	CloudAuthModalCtrl.$inject = ['$scope', 'Choosatrons', 'Profiles', 'authService'];

	function CloudAuthModalCtrl($scope, Choosatrons, Profiles, authService) {
		var vm = this;

		// Variables
		vm.profile = null;
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
					console.log("Cloud Auth Logged in.", vm.profile.auth());
					vm.info = { message: "Logged in to the cloud!" };
				}
			};
			console.log(authService.authStatus.remoteState);
			Profiles.editing.auth().username(vm.username);
			authService.login(Profiles.editing.auth(), vm.password)
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
					console.log("Cloud Auth Registered", vm.profile.auth());
					vm.info = { message: "You've been registered in the cloud!" };
				}
			};

			Profiles.editing.auth().username(vm.username);
			authService.register(Profiles.editing.auth(), vm.password)
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
