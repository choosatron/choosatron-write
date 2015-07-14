(function() {
	'use strict';

	angular.module('storyApp')
		.service('authService', AuthService);

	AuthService.$inject = ['Particle'];

	function AuthService(Particle) {
		this.particle = function(aAuth) {
			return new Particle(aAuth && aAuth.getToken());
		};
		this.authStatus = {
			remoteState: 'idle',
			status: 'ready',
			error: null,
		};
	}

	AuthService.prototype.saveToken = function(aAuth, aToken) {
		var now = +new Date();
		aAuth.setToken(aToken.access_token);
		aAuth.setType(aToken.token_type);
		aAuth.setExpiration(+new Date(now + (aToken.expires_in * 1000)));
		this.authStatus.status = 'success';
		this.authStatus.remoteState = 'idle';
	};

	AuthService.prototype.register = function(aAuth, aPassword) {
		this.authStatus.error = null;
		this.authStatus.status = 'ready';
		this.authStatus.remoteState = 'working';
		var login = this.login.bind(this, aAuth, aPassword);
		return this.particle(aAuth)
			.createUser(aAuth.username, aPassword)
			.then(login)
			.catch(onError);
	};

	AuthService.prototype.login = function(aAuth, aPassword) {
		this.authStatus.error = null;
		this.authStatus.status = 'ready';
		this.authStatus.remoteState = 'working';
		var params = {
			username: aAuth.getUsername(),
			password: aPassword
		};
		if (aAuth.getToken()) {
			params.access_token = aAuth.getToken();
		}

		var saveToken = this.saveToken.bind(this, aAuth);
		var onError = this.onError.bind(this);
		return this.particle(aAuth)
			.login(aAuth.username, aPassword)
			.then(saveToken)
			.catch(onError);
	};

	AuthService.prototype.onError = function(aError) {
		console.log('authService: API call completed on promise fail: ', aError);
		this.authStatus.error = aError;
		this.authStatus.status = 'error';
		this.authStatus.remoteState = 'idle';
	};

	AuthService.prototype.reset = function() {
		console.log("reset");
		this.authStatus.error = null;
		this.authStatus.status = 'ready';
		this.authStatus.remoteState = 'idle';
	};

	AuthService.prototype.logout = function() {
		this.reset();
	};

	AuthService.prototype.loadDevices = function(aAuth) {
		return this.particle(aAuth).listDevices.then(function(devices) {
			aAuth.setDevices(devices);
		});
	};

	AuthService.prototype.claimDevice = function(aAuth, aDeviceId) {
		return this.particle(aAuth).claimCore(aDeviceId);
	};

})();
