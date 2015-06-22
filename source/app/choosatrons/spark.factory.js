(function() {

'use strict';

angular.module('storyApp')
.factory('Spark', ['$q', '$http', 'file', function($q, $http, $fs) {

	function Spark(token) {
		this.baseUrl      = 'https://api.spark.io';
		this.clientId     = 'Spark';
		this.clientSecret = 'Spark';
		this.accessToken  = token;
		this.version      = 'v1';

		this.$q           = $q;
		this.$http        = $http;
		this.$fs          = $fs;

		this.setHttpDefaults();
	}

	Spark.prototype.setHttpDefaults = function() {
		var xForm = {'Content-Type' : 'application/x-www-form-urlencoded'};

		this.$http.defaults.headers.post = xForm;
		this.$http.defaults.headers.put  = xForm;
	};

	// Converts the $http specific promise into the more
	// standard $q promise
	Spark.prototype.promise = function(method, url, form) {
		var deferred = this.$q.defer();
		var data = form && $.param(form);

		this.$http[method](url, data)
		.success(deferred.resolve)
		.error(deferred.reject);

		return deferred.promise;
	};

	// Returns a json object suitable for posting to an endpoint
	// This is where we go chrome-app specific. In order to read
	// a file in a packaged app, we need to use chromes internal
	// apis.
	Spark.prototype.getFile = function(filename) {
		var deferred = this.$q.defer();
		var fs = this.$fs;

		function gotEntry(entry) {
			entry.file(deferred.resolve);
		}

		fs.getPackageDirectoryEntry()
		.then(function(dir) {
			console.info('Got package directory', dir);
			var opts = {create: false};
			dir.getFile(filename, opts, gotEntry, deferred.reject);
		});

		return deferred.promise;
	};

	Spark.prototype.endpoint = function(path, withToken) {
		var token = withToken ? '?access_token=' + this.accessToken : '';
		return this.baseUrl + '/' + this.version + '/' + path + token;
	};

	// Creates a new user and logs them in
	Spark.prototype.createUser = function(un, pw) {
		var deferred = this.$q.defer();
		var data = {
			username : un,
			password : pw
		};
		var self = this;

		function setToken(data) {
			self.accessToken = data.access_token || data.accessToken;
			deferred.resolve(data);
		}

		this.promise('post', this.endpoint('users'), data)
			.then(setToken)
			.catch(deferred.reject);

		return deferred.promise;
	};

	// Logs a member in
	Spark.prototype.login = function(aUsername, aPassword) {
		var deferred = this.$q.defer();
		var data = {
			username      : aUsername,
			password      : aPassword,
			grant_type    : 'password',
			client_id     : this.clientId,
			client_secret : this.clientSecret
		};
		var self = this;

		function setToken(data) {
			self.accessToken = data.access_token || data.accessToken;
			deferred.resolve(data);
		}

		// There's no versioning for oauth, apparently
		this.promise('post', this.baseUrl + '/oauth/token', data)
			.then(setToken)
			.catch(deferred.reject);

		return deferred.promise;
	};

	Spark.prototype.listDevices = function() {
		return this.promise('get', this.endpoint('devices', true));
	};

	Spark.prototype.listDevicesWithAttributes = function() {
		var deferred  = $q.defer();
		var collected = [];
		var self      = this;

		function listed(devices) {
			if (!devices || devices.length === 0) {
				return deferred.resolve(collected);
			}

			var device = devices.shift();

			self.getAttributes(device.id)
			.then(function(attributes) {
				device.attributes = attributes;
				collected.push(device);
				listed(devices);
			});
		}

		this.listDevices().then(listed).catch(deferred.reject);

		return deferred.promise;
	};

	Spark.prototype.getAttributes = function(coreId) {
		return this.promise('get', this.endpoint('devices/' + coreId, true));
	};

	Spark.prototype.changeProduct = function(coreId, productId, updateAfter) {
		var data = {
			product_id         : product_id,
			update_after_claim : updateAfter,
			access_token       : this.accessToken
		};
		return this.promise('put', this.endpoint('devices/' + coreId), data);
	};

	Spark.prototype.claimCore = function(coreId, productId) {
		var data = {
			id           : coreId,
			access_token : this.accessToken
		};
		if (productId) {
			data.product_id = productId;
		}
		return this.promise('post', this.endpoint('devices'), data);
	};

	Spark.prototype.removeCore = function(coreId) {
		return this.promise('delete', this.endpoint('devices/' + coreId, true));
	};

	Spark.prototype.flashCore = function(coreId, path) {
		var url  = this.endpoint('devices/' + coreId, true);
		var deferred = this.$q.defer();
		var self = this;

		function putFile(file) {
			if (!file) {
				console.info('Empty file', path);
				deferred.reject('Empty file');
				return;
			}

			console.info('Got file', path, file);

			var form = new FormData();
			form.append('file', file);

			$http({
				url              : url,
				method           : 'PUT',
				headers          : {'Content-Type': undefined},
				data             : form,
				transformRequest : []
			})
			.success(deferred.resolve)
			.error(deferred.reject);
		}

		this.getFile(path).then(putFile).catch(deferred.reject);
		return deferred.promise;
	};

	Spark.prototype.renameCore = function(coreId, name) {
		var data = {
			name         : name,
			access_token : this.accessToken
		};
		return this.promise('put', this.endpoint('devices/' + coreId), data);
	};


	// Subscribes to an event stream and returns the EventSource object.
	Spark.prototype.subscribe = function(coreId, eventName) {
		var path = '';

		if (!coreId) {
			path += 'events';
		}
		else {
			path += 'devices/' + coreId + '/events';
		}

		if (eventName) {
			path += '/' + eventName;
		}

		console.info("subscription", path);
		return new EventSource(this.endpoint(path, true));
	};


	// Listens to an EventSource object until the specified event occurs.
	// Returns a promise that resolves with the data provided when the event occurs.
	// If the listener is persistent, the deferred promise will fire
	// notify events when messages are recieved. For a non-persistent
	// listener, the promise will resolve with the response instead.
	Spark.prototype.listen = function(coreId, eventName, persistent) {
		var deferred = this.$q.defer();
		var source   = this.subscribe(coreId, eventName);
		var baseUrl  = this.baseUrl;

		function response(event, e) {
			e.source = source;
			e.event  = event;
			e.valid  = e.origin === baseUrl;
			console.info(event, e);
			return e;
		}

		function openHandler(e) {
			var rsp = response('open', e);
			if (rsp.valid) {
				deferred.notify(rsp);
			}
		}

		function eventHandler(e) {
			var rsp  = response(eventName, e);
			rsp.data = JSON.parse(e.data);

			if (persistent && rsp.valid) {
				deferred.notify(rsp);
			}

			if (!persistent) {
				source.close();
				if (rsp.valid) {
					deferred.resolve(rsp);
				}
				else {
					deferred.reject(rsp);
				}
			}
		}

		function errorHandler(e) {
			var rsp = response('error', e);

			if (persistent && rsp.valid) {
				deferred.notify(rsp);
			}

			if (!persistent) {
				source.close();
				deferred.reject(rsp);
			}
		}

		function messageHandler(e) {
			var rsp = response('message', e);
			if (rsp.valid) {
				deferred.notify(rsp);
			}
		}

		source.addEventListener(eventName, eventHandler, false);
		source.onopen    = openHandler;
		source.onerror   = errorHandler;
		source.onmessage = messageHandler;

		return deferred.promise;
	};


	// Post to a named function on a device
	Spark.prototype.callFunction = function(coreId, method, args) {
		args = args || '';
		var url  = this.endpoint('devices/' + coreId + '/' + method);
		var data = {
			access_token : this.accessToken,
			args         : args
		};
		return this.promise('post', url, data);
	};

	return Spark;
}]);

})();
