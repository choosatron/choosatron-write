(function() {

'use strict';

angular.module('storyApp.utils').service('Serial', ['$q', 'ArrayBufferFactory',

function($q, ArrayBufferFactory) {

	// Internal class used for storing event handlers to handle
	// received serial data.
	function Listener(callback, connectionId) {
		this.callback     = callback;
		this.connection   = null;
		this.ignored      = [];
		this.uses         = 0;
		this.called       = 0;
		this.toString     = false;
	}

	/**
	  * Calls the listener callback if the data is appropriate.
	  * If the callback returns true, then it is removed immediately.
	 **/
	Listener.prototype.send = function(info) {

		if (this.connection && this.connection.connectionId !== info.connectionId) {
			return;
		}

		if (this.toString && !info.text) {
			info.text = ArrayBufferFactory.toString(info.data);
		}

		if (this.ignored.indexOf(info.text) >= 0) {
			return;
		}

		this.called++;

		var done = this.callback(info);

		if (done) {
			return false;
		}

		return this.uses === 0 || this.uses < this.called;
	};

	// Ignore a particular string of data. Useful for filtering out
	// echoed information.
	Listener.prototype.ignore = function(ignored) {
		this.ignored.push(ignored);
		return this;
	};


	// { "vendorId": 7504, "productId": 24701 }, // VID: 0x1D50, PID: 0x607D (Spark w/ WiFi - Serial Mode)
	// { "vendorId": 7504, "productId": 24703 } // VID: 0x1D50, PID: 0x607F (Spark w/ WiFi - CORE DFU)

	function Serial(api) {
		this.ports      = [];
		this.listeners  = [];
		this.connection = null;
		this.debug      = false;
		this.receiver   = this.onReceived.bind(this);
		this.init(api || chrome.serial);
	}

	Serial.ConnectionOptions = {
		bitrate    : 9600,
		dataBits   : 'eight',
		parityBit  : 'no',
		stopBits   : 'one'
	};

	Serial.DefaultTimeout = 1000;

	// Deconstructor. Must be called explicitly.
	Serial.prototype.destroy = function() {
		this.api.onReceive.removeListener(this.receiver);
		if (this.connection) {
			this.disconnect();
		}
	};

	/**
	  *¬Inializes the Serial interface
	 **/
	Serial.prototype.init = function(api) {
		this.api = api;
		this.api.onReceive.addListener(this.receiver);
	};


	Serial.prototype.onReceived = function(info) {
		if (this.debug) {
			info.text = ArrayBufferFactory.toString(info.data);
			console.info("this.api.onReceive", info);
		}

		if (!this.listeners) {
			return;
		}

		// Loop the listeners and fire off a message. Remove the listener if
		// it was only meant to be used once.
		this.listeners = this.listeners.filter(function(listener) {
			return listener.send(info);
		});
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
		var listener = new Listener(callback, this.connection);
		listener.uses = 1;
		listener.toString = toString;

		this.listeners.push(listener);

		return listener;
	};


	/**
	  *¬Adds a listener to the current connection
	 **/
	Serial.prototype.listen = function(callback, toString) {
		var listener = new Listener(callback, this.connection);
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
		if (this.debug) {
			console.info("Sending", str);
		}
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
		options = options || Serial.ConnectionOptions;

		var connected = function(info) {

			self.connection = info;

			if (self.debug) {
				console.info("Connected", info);
			}

			deferred.resolve();
		};

		var connect = function() {

			if (!path && self.ports.length) {
				path = self.ports[0].path;
			}

			if (!path) {
				deferred.reject(new Error("No path found"));
			}

			if (self.debug) {
				console.info("Connecting", path, options);
			}

			self.api.connect(path, options, connected);
		};

		if (!this.ports) {
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
			return deferred.promise;
		}

		if (this.debug) {
			console.info("Disconnecting", this.connection);
		}

		var self = this;
		this.api.disconnect(self.connection.connectionId, function(info) {
			if (this.debug) {
				console.info("Disconnected", info);
			}
			self.connection = null;
			deferred.resolve();
		});

		return deferred.promise;
	};


	// Sends a message and reads the result until the specified
	// terminating character is received.
	Serial.prototype.read = function(send, until) {
		var msg = '';
		var deferred = $q.defer();
		until = until || '\n';

		function readPart(info) {
			var part = info.text;
			msg += part;
			if (part.indexOf(until)) {
				deferred.resolve(msg);
				return true;
			}
			return false;
		}

		this.listen(readPart, true);
		this.send(send);

		return deferred.promise;
	};


	/**
	  *¬Load up the available ports
	  * Specify a filter function or regex to limit the list of ports
	 **/
	Serial.prototype.load = function(filter) {
		var deferred = $q.defer();
		var self = this;
		this.api.getDevices(function(ports) {
			ports = ports || [];
			if (typeof filter === 'function') {
				self.ports = ports.filter(filter);
			}
			else if (typeof filter === 'string') {
				self.ports = ports.filter(function(port) {
					return port.path.match(filter);
				});
			}
			else {
				self.ports = ports;
			}
			deferred.resolve();
		});
		return deferred.promise;
	};


	// Sends out a polling message and returns a promise
	// that will resolve with an object that maps
	// ports to received responses
	Serial.prototype.broadcast = function(msg, options, timeout) {
		var data = typeof msg !== 'object' ? ArrayBufferFactory.fromString(msg) : msg;
		var deferred = $q.defer();
		var self = this;
		timeout = timeout || Serial.DefaultTimeout;

		if (!this.ports.length) {
			deferred.reject('No ports found');
			return deferred.promise;
		}

		if (this.debug) {
			console.info("Broadcasting", msg, "to", this.ports);
		}

		var connections = {};
		var input = {};

		var sent = function(info) {
			if (info.error) {
				console.error('Send failed', info);
			}
		};

		var transmit = function(port) {
			self.api.connect(port.path, options, function(con) {
				connections[con.connectionId] = port.path;
				if (self.debug) {
					console.info("Sending broadcast", con);
				}
				self.api.send(con.connectionId, data, sent);
			});
		};

		var received = function(info) {
			var path = connections[info.connectionId];
			if (!input[path]) {
				input[path] = info.text;
			}
			else {
				input[path] += info.text;
			}
		};

		var disconnected = function(result) {
			console.info('disconnected', connections[i], d);
		};

		var done = function() {
			self.mute();
			for (var id in connections) {
				self.api.disconnect(parseInt(id), disconnected);
			}
			if (self.debug) {
				console.info("Collected", input);
			}
			deferred.resolve(input);
		};

		this.listen(received, true);
		for (var i=0; i<this.ports.length; i++) {
			transmit(this.ports[i]);
		}

		setTimeout(done, timeout);

		return deferred.promise;
	};


	return Serial;

}]);

})();
