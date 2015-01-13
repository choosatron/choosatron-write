(function() {
	'use strict';

	angular.module('storyApp')
		.service('authService', AuthService);

	AuthService.$inject = [];

	function AuthService() {
		this.authStatus = {
			remoteState: 'idle',
			error: null,
		};
	}

	AuthService.prototype.saveToken = function(aAuth, aToken) {
		var now = +new Date();
		aAuth.token      = aToken.access_token;
		aAuth.type       = aToken.token_type;
		aAuth.expiration = +new Date(now + (aToken.expires_in * 1000));
		this.authStatus.remoteState = 'success';
	};

	AuthService.prototype.register = function(aAuth, aPassword) {
		this.authStatus.remoteState = 'working';
		var login = this.login.bind(this, aAuth, aPassword);
		return spark
			.createUser(aAuth.username, aPassword)
			.then(login)
			.catch(onError);
	};

	AuthService.prototype.login = function(aAuth, aPassword) {
		this.authStatus.remoteState = 'working';
		var params = {
			username: aAuth.username,
			password: aPassword
		};
		if (aAuth.token) {
			params.access_token = aAuth.token;
		}
		var saveToken = this.saveToken.bind(this, aAuth);
		var onError = this.onError.bind(this);
		return spark
			.login(params)
			.then(saveToken)
			.catch(onError);
	};

	AuthService.prototype.onError = function(aError) {
		console.log('authService: API call completed on promise fail: ', aError);
		this.authStatus.error = aError;
		this.authStatus.remoteState = 'error';
		//throw aError; // TODO: Get rid of this?
	};
})();
