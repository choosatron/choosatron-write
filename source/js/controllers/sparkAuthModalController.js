(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('SparkAuthModalCtrl', SparkAuthModalCtrl);

	SparkAuthModalCtrl.$inject = ['ngDialog'];

	function SparkAuthModalCtrl(ngDialog) {
		var vm = this;

		vm.authState = 'login';
		vm.remoteState = 'idle';

		vm.loginToCloud = loginToCloud;

		function loginToCloud() {
			console.log("Logging in to cloud");
			var promise = spark.login({ username: vm.username, password: vm.password });

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
	}

})();