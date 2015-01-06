(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('CloudAuthModalCtrl', CloudAuthModalCtrl);

	CloudAuthModalCtrl.$inject = ['$scope', 'ngDialog'];

	function CloudAuthModalCtrl($scope, ngDialog) {
		var vm = this;

		vm.profile = $scope.profile;
		vm.authState = 'login';
		vm.remoteState = 'idle';

		vm.loginToCloud = loginToCloud;
		vm.changeAuthState = changeAuthState;

		function loginToCloud() {
			console.log("Logging in to cloud");
			console.log($scope.ngDialogData.profile.name);
			//var promise = spark.login({ username: vm.username, password: vm.password });

			var promise = spark.login({ accessToken: '7e9034ed8f14bed6cb1a0a3bf7c3a0df3b795714' });

			promise.then(
				function(token){
					// If login is successful we get an accessToken
					// that is stored in the Spark lib for future use.
					console.log("Logged in.");
					console.log(token);
				},
				function(err) {
					console.log('API call completed on promise fail: ', err);
				}
			);
		}

		function changeAuthState(aNewState) {
			vm.authState = aNewState;
		}
	}

})();
