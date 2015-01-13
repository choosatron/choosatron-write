(function() {
	'use strict';

	angular.module('storyApp')
		.service('authService', authService);

	authService.$inject = [];
	function authService() {

		var service = {

			saveToken : saveToken,
			register : register,
			login : login

		};

		return service;
		///////////////

		function saveToken(aAuth, aToken) {
			var now = +new Date();
			console.log("saving token!!!");

			aAuth.token      = aToken.access_token;
			aAuth.type       = aToken.token_type;
			aAuth.expiration = +new Date(now + (aToken.expires_in * 1000));

			return this;
		}

		function register(aAuth, aPassword) {
			return spark
				.createUser(aAuth.username, aPassword)
				.then(this.login.bind(this, aAuth, aPassword));
		}

		function login(aAuth, aPassword) {
			var params = {
				username: aAuth.username,
				password: aPassword
			}
			if (aAuth.token) {
				params['access_token'] = aAuth.token;
			}
			return spark
				.login(params)
				.then(this.saveToken.bind(this, aAuth));
		}
	}

})();