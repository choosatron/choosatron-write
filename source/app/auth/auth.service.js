(function() {
	'use strict';

	angular.module('storyApp')
		.service('AuthService', AuthService);

	AuthService.$inject = ['profiles'];
	function AuthService(profiles) {

		var service = {

			//saveToken : saveToken,
			register : register,
			login : login

		};

		return service;
		///////////////

		/*function saveToken(aToken) {
			var now = +new Date();

			this.token      = aToken.access_token;
			this.type       = aToken.token_type;
			this.expiration = +new Date(now + (aToken.expires_in * 1000));

			return this;
		}*/

		function register(aAuth, aPassword) {
			return spark
				.createUser(aAuth.username, aPassword)
				.then(this.login.bind(this, aPassword));
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
				.then(this.saveToken.bind(this));
		}
	}

})();