(function() {

'use strict';

angular.module('storyApp.utils').service('serial', ['$q', 'ArrayBufferFactory',

function($q, ArrayBufferFactory) {

	function Serial() {
		this.api        = null;
		this.devices    = [];
		this.listeners  = [];
		this.connection = null;
	}

	function Listener(callback) {
		this.callback = callback;
		this.ignored  = [];
		this.uses     = 0;
		this.called   = 0;
		this.toString = false;
	}

	/**
	  * Calls the listener callback if the data is appropriate.
	  * If the callback returns true, then it is removed immediately.
	 **/
	Listener.prototype.call = function(data) {
		if (this.ignored.indexOf(data) >= 0) {
			return;
		}
		if (this.toString) {
			data = ArrayBufferFactory.toString(data);
		}

		this.called++;

		var done = this.callback(data);

		if (done) {
			return false;
		}

		return this.uses === 0 || this.uses < this.called;
	};

	Listener.prototype.ignore = function(ignored) {
		this.ignored.push(ignored);
		return this;
	};

	/**
	  *¬Inializes the Serial interface
	 **/
	Serial.prototype.init = function(api) {
		this.api = api;

		var received = function(info) {

			if (!this.listeners) {
				return;
			}

			if (!this.connection) {
				console.log('No current connection. Ignoring serial message', info);
				return;
			}

			if (this.connection.connectionId !== info.connectionId) {
				console.log('Serial message from unexpected connection. Skipping', info);
				return;
			}

			// Loop the listeners and fire off a message. Remove the listener if
			// it was only meant to be used once.
			this.listeners = this.listeners.filter(function(listener) {
				return listener.call(info.data);
			});
		};

		this.api.onReceive.addListener(received.bind(this));
	};


	/**
	  *¬Clears out the listeners
	 **/
	Serial.prototype.mute = function() {
		this.listeners = [];
	};


	/**
	  *¬Adds a one-time listener to this connection. 
	 **/
	Serial.prototype.once = function(callback, toString) {
		var listener = new Listener(callback);
		listener.uses = 1;
		listener.toString = toString;

		this.listeners.push(listener);

		return listener;
	};

	/**
	  *¬Adds a listener to the current connection
	 **/
	Serial.prototype.listen = function(callback, toString) {
		var listener = new Listener(callback);
		listener.toString = toString;

		this.listeners.push(listener);
		return listener;
	};


	Serial.prototype.sendMultiple = function(cmds, wait) {
		var deferred = $q.defer();
		var send = this.send.bind(this);
		wait = wait || 100; //ms
		function run() {
			if (cmds.length === 0) {
				deferred.resolve();
				return;
			}

			var cmd = cmds.shift() + '\n';
			console.info("Sending", cmd);
			send(cmd).then(function() {
				setTimeout(run, wait);
			});
		}
		run();
		return deferred.promise;
	};


	/**
	  *¬Send an ArrayBuffer to the connected port.
	 **/
	Serial.prototype.send = function(str) {
		var data = ArrayBufferFactory.fromString(str);
		return this.sendData(data);
	};


	/**
	  *¬Send an ArrayBuffer to the connected port.
	 **/
	Serial.prototype.sendData = function(data) {
		if (!this.connection) {
			throw new Error("Connect first before sending a message");
		}
		var deferred = $q.defer();
		var self = this;
		var sent = function(info) {
			if (info.error) {
				deferred.reject(info);
			}
			else {
				deferred.resolve(info);
			}
		};

		console.info('Sending data to serial', this.connection, data);
		this.api.send(this.connection.connectionId, data, sent);
		return deferred.promise;
	};

	/**
	  *¬Connect to the specified path.
	 **/
	Serial.prototype.connect = function(path, options) {
		var deferred = $q.defer();
		if (this.connection) {
			this.disconnect();
		}
		var self = this;

		var connected = function(info) {
			self.connection = info;
			deferred.resolve();
		};

		var connect = function() {

			if (!path && self.devices.length) {
				path = self.devices[0].path;
			}

			if (!path) {
				deferred.reject(new Error("No path found"));
			}

			self.api.connect(path, options, connected);
		};

		if (!this.devices) {
			this.load().then(connect);
		}
		else {
			connect();
		}

		return deferred.promise;
	};


	/**
	  *¬Disconnect from the current connection
	 **/
	Serial.prototype.disconnect = function() {
		var deferred = $q.defer();
		if (!this.connection) {
			deferred.resolve();
		}
		else {
			this.api.disconnect(this.connection.connectionId, deferred.resolve);
		}
		return deferred.promise;
	};

	/**
	  *¬Load up the available devices
	  * Specify a filter function or regex to limit the list of devices
	 **/
	Serial.prototype.load = function(filter) {
		var deferred = $q.defer();
		var self = this;
		this.api.getDevices(function(ports) {
			ports = ports || [];
			if (typeof filter === 'function') {
				self.devices = ports.filter(filter);
			}
			else if (typeof filter === 'string') {
				self.devices = ports.filter(function(port) {
					return port.path.match(filter);
				});
			}
			else {
				self.devices = ports;
			}
			deferred.resolve();
		});
		return deferred.promise;
	};


	var serial = new Serial();
	serial.init(chrome.serial);
	return serial;

}]);

})();
