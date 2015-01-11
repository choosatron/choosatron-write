(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ChoosatronAddModalCtrl', ChoosatronAddModalCtrl);

	ChoosatronAddModalCtrl.$inject = ['$scope', 'Profile'];

	function ChoosatronAddModalCtrl($scope, Profile) {
		var vm = this;

		vm.profile = $scope.ngDialogData || new Profile();
		vm.state = '';
		vm.remoteState = 'idle';

		vm.resetState = resetState;
		vm.changeState = changeState;
		vm.loginToCloud = loginToCloud;
		vm.registerInCloud = registerInCloud;
		vm.changeAuthState = changeAuthState;

		activate();

		function activate() {
			resetState();
		}

		function resetState() {
			if (vm.profile.linkedWithCloud) {
				vm.state = "state_new_or_add";
			} else {
				vm.state = "state_no_cloud";
			}
		}

		function changeState(aState) {
			vm.state = aState;
		}

		function loginToCloud() {
			console.log("Logging in to cloud");

			vm.remoteState = 'working';

			var promise = spark.login({
				username: vm.profile.cloudUser,
				password: vm.password
			});

			promise.then(
				function(token){
					// If login is successful we get an accessToken
					// that is stored in the Spark lib for future use.
					console.log("Logged in.");
					console.log(token);
					vm.remoteState = 'idle';
					vm.info = { message: "Logged in to the cloud!" };
					vm.profile.cloudToken = token;
				},
				function(err) {
					console.log('API call completed on promise fail: ', err);
					vm.error = err;
					vm.remoteState = 'idle';
				}
			);
		}

		function registerInCloud() {
			console.log("Logging in to cloud");

			vm.remoteState = 'working';

			var promise = spark.createUser(
				vm.profile.cloudUser,
				vm.password
			);

			promise.then(loginToCloud);
		}

		function changeAuthState(aNewState) {
			vm.authState = aNewState;
		}
	}

})();