(function() {

'use strict';

angular.module('storyApp.utils').service('Serial', ['$q', '$timeout', 'ArrayBufferFactory',

function($q, $timeout, ArrayBufferFactory) {

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


	// { "vendorId": 7504, "productId": 24701 }, // VID: 0x1D50, PID: 0x607D (Core w/ WiFi - Serial Mode)
	// { "vendorId": 7504, "productId": 24703 }  // VID: 0x1D50, PID: 0x607F (Core w/ WiFi - CORE DFU)

	function Serial(aApi) {
		this.ports      = [];
		this.listeners  = [];
		this.connection = null;
		this.debug      = false;
		this.receiver   = this.onReceived.bind(this);
		this.init(aApi || chrome.serial);
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
	  * Inializes the Serial interface
	 **/
	Serial.prototype.init = function(aApi) {
		this.api = aApi;
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
	  * Clears out the listeners
	 **/
	Serial.prototype.mute = function() {
		this.listeners = [];
	};


	/**
	  * Adds a one-time listener to this connection.
	 **/
	Serial.prototype.once = function(callback, toString) {
		var listener = new Listener(callback, this.connection);
		listener.uses = 1;
		listener.toString = toString;

		this.listeners.push(listener);

		return listener;
	};


	/**
	  * Adds a listener to the current connection
	 **/
	Serial.prototype.listen = function(callback, toString) {
		var listener = new Listener(callback, this.connection);
		listener.toString = toString;

		this.listeners.push(listener);
		return listener;
	};


	/**
	  * Send an ArrayBuffer to the connected port.
	 **/
	Serial.prototype.send = function(str) {
		if (this.debug) {
			console.info("Sending", str);
		}
		var data = ArrayBufferFactory.fromString(str);
		return this.sendData(data);
	};


	/**
	  * Send an ArrayBuffer to the connected port.
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
	  * Connect to the specified path.
	 **/
	Serial.prototype.connect = function(path, options) {
		var deferred = $q.defer();
		if (this.connection) {
			this.disconnect();
		}
		var self = this;
		options = options || Serial.ConnectionOptions;

		var connected = function(info) {
			// Check for failure, like trying to connect
			// to a device no longer plugged in.
			if (chrome.runtime.lastError) {
				deferred.reject();
			} else {
				self.connection = info;

				if (self.debug) {
					console.info("Connected", info);
				}
				deferred.resolve();
			}
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
		} else {
			connect();
		}

		return deferred.promise;
	};


	/**
	  * Disconnect from the current connection
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
	// terminating byte is received. Returns a promise that
	// resolves with the byte data of the message sent
	// up until the terminating byte.
	Serial.prototype.sendDataUntil = function(data, untilByte) {
		var buffer   = new ArrayBuffer(1024);
		var builder  = ArrayBufferFactory.Builder(buffer);
		var offset   = 0;
		var deferred = $q.defer();

		function readPart(info) {
			for (var i = 0; i < info.data.length; i++) {
				var byte = info.data[i];
				builder.setInt8(offset, byte);
				if (byte === untilByte) {
					var msg = builder.trim();
					deferred.resolve(msg);
					return true;
				}
				offset++;
			}
			return false;
		}

		this.listen(readPart, true);
		this.sendData(data);

		return deferred.promise;
	};


	/**
	  * Load up the available ports
	  * Specify a filter function or regex to limit the list of ports
	 **/
	Serial.prototype.load = function(aFilter) {
		var deferred = $q.defer();
		var self = this;
		this.api.getDevices(function(ports) {
			ports = ports || [];
			if (typeof aFilter === 'function') {
				self.ports = ports.filter(aFilter);
			}
			else if (typeof aFilter === 'string') {
				self.ports = ports.filter(function(aPort) {
					return aPort.path.match(aFilter);
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
	Serial.prototype.broadcast = function(aMsg, aOptions, aTimeout) {
		var data = typeof aMsg !== 'object' ? ArrayBufferFactory.fromString(aMsg) : aMsg;
		var deferred = $q.defer();
		var self = this;
		aTimeout = aTimeout || Serial.DefaultTimeout;

		if (!this.ports.length) {
			deferred.reject('No ports found');
			return deferred.promise;
		}

		if (this.debug) {
			console.info("Broadcasting", aMsg, "to", this.ports);
		}

		var connections = {};
		var input = {};

		var sent = function(aInfo) {
			console.log(aInfo);
			if (aInfo.error) {
				console.error('Send failed', aInfo);
			}
		};

		var transmit = function(aPort) {
			self.api.connect(aPort.path, aOptions, function(aCon) {
				if (chrome.runtime.lastError || !aCon) {
					console.warn("Unable to connect to %s, there may already be a connection open.", aPort.path);
				} else {
					if (self.debug) {
						console.info("Sending broadcast", aCon);
					}
					connections[aCon.connectionId] = aPort.path;
					self.api.send(aCon.connectionId, data, sent);
				}
			});
		};

		var received = function(aInfo) {
			console.log(aInfo);
			var path = connections[aInfo.connectionId];
			if (!input[path]) {
				input[path] = aInfo.text;
			}
			else {
				input[path] += aInfo.text;
			}
		};

		var flushed = function(aResult) {
			console.info('Connection flushed', aResult);
		};

		var disconnected = function(aResult) {
			console.info('Broadcast disconnected', aResult);
		};

		var done = function() {
			self.mute();
			for (var id in connections) {
				self.api.flush(parseInt(id), flushed);
				self.api.disconnect(parseInt(id), disconnected);
			}
			if (self.debug) {
				console.info("Collected", input);
			}
			deferred.resolve(input);
		};

		this.listen(received, true);
		for (var i = 0; i < this.ports.length; i++) {
			transmit(this.ports[i]);
		}

		$timeout(done, aTimeout);

		return deferred.promise;
	};


	return Serial;

}]);

})();
