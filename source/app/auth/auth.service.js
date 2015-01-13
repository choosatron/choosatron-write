(function() {
	'use strict';

	angular.module('storyApp')
		.service('AuthService', AuthService);

	AuthService.$inject = ['profiles'];

	function AuthService(profiles) {
		this.profiles = profiles;
	}

	AuthService.prototype.saveToken = function(aAuth, aToken) {
		var now = +new Date();

		aAuth.token      = aToken.access_token;
		aAuth.type       = aToken.token_type;
		aAuth.expiration = +new Date(now + (aToken.expires_in * 1000));
	};

	AuthService.prototype.register = function(aAuth, aPassword) {
		var login = this.login.bind(this, aAuth, aPassword);
		return spark
			.createUser(aAuth.username, aPassword)
			.then(login);
	};

	AuthService.prototype.login = function(aAuth, aPassword) {
		var params = {
			username: aAuth.username,
			password: aPassword
		};
		if (aAuth.token) {
			params.access_token = aAuth.token;
		}
		var saveToken = this.saveToken.bind(this, aAuth);
		return spark
			.login(params)
			.then(saveToken);
	};
})();
