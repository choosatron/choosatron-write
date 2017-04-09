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
		this.debug      = false;
		this.ports      = [];
		this.listeners  = [];
		this.connection = null;
		this.boundOnReceive = this.onReceive.bind(this);
		this.boundOnReceiveError = this.onReceiveError.bind(this);
		this.onConnect = new chrome.Event();
		this.onReceive = new chrome.Event();
		this.onError = new chrome.Event();
		this.api = chrome.serial;
		//this.receiver = this.onReceived.bind(this);
		//this.init(aApi || chrome.serial);
	}

	Serial.ConnectionOptions = {
		bitrate    : 9600,
		dataBits   : 'eight',
		parityBit  : 'no',
		stopBits   : 'one',
		receiveTimeout : 1000
	};

	//Serial.DefaultTimeout = 4000;

	// Deconstructor. Must be called explicitly.
	/*Serial.prototype.destroy = function() {
		this.api.onReceive.removeListener(this.receiver);
		if (this.connection) {
			this.disconnect();
		}
	};*/


	/**
	  * Inializes the Serial interface
	 **/
	/*Serial.prototype.init = function(aApi) {
		this.api = aApi;
		//if (!this.api.onReceive.hasListeners()) {
			console.log("INITED");
			console.trace();
			this.api.onReceive.addListener(this.receiver);
		//}
	};*/


	Serial.prototype.onReceive = function(aInfo) {
		if (this.debug) {
			aInfo.text = ArrayBufferFactory.toString(aInfo.data);
			//console.info("this.api.onReceive", aInfo);
		}

		if (!this.listeners || (this.listeners.length === 0)) {
			//console.log("no listeners");
			return;
		}

		// Loop the listeners and fire off a message. Remove the listener if
		// it was only meant to be used once.
		this.listeners = this.listeners.filter(function(listener) {
			return listener.send(aInfo);
		});
	};


	/*Serial.prototype.onReceive = function(aReceiveInfo) {
		if (aReceiveInfo.connectionId !== this.connectionId) {
			return;
		}

		this.lineBuffer += ab2str(receiveInfo.data);

		var index;
		while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
			var line = this.lineBuffer.substr(0, index + 1);
			this.onReadLine.dispatch(line);
			this.lineBuffer = this.lineBuffer.substr(index + 1);
		}
	};*/


	Serial.prototype.onReceiveError = function(aErrorInfo) {
		if (aErrorInfo.connectionId === this.connection.connectionId) {
			this.onError.dispatch(aErrorInfo.error);
		}
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
	/*Serial.prototype.once = function(aCallback, aToString) {
		console.log("Serial-once");
		var listener = new Listener(aCallback, this.connection);
		listener.uses = 1;
		listener.toString = aToString;

		this.listeners.push(listener);

		return listener;
	};*/


	/**
	  * Adds a listener to the current connection
	 **/
	Serial.prototype.listen = function(aCallback, aToString) {
		if (this.debug) {
			console.log("Serial-listen");
		}
		var listener = new Listener(aCallback, this.connection);
		listener.toString = aToString;

		this.listeners.push(listener);
		return listener;
	};


	/**
	  * Send an ArrayBuffer to the connected port.
	 **/
	Serial.prototype.send = function(aStr) {
		if (this.debug) {
			console.info("Serial-send:", aStr);
		}
		var data = ArrayBufferFactory.fromString(aStr);
		return this.sendData(data);
	};


	/**
	  * Send an ArrayBuffer to the connected port.
	 **/
	Serial.prototype.sendData = function(aData) {
		if (!this.connection) {
			throw new Error("Connect first before sending a message");
		}
		var deferred = $q.defer();
		var self = this;
		var sent = function(aInfo) {
			if (aInfo.error) {
				deferred.reject(aInfo);
			} else {
				deferred.resolve(aInfo);
			}
		};

		console.info('Sending data to serial', this.connection, aData);
		this.api.send(this.connection.connectionId, aData, sent);
		return deferred.promise;
	};


	/**
	  * Connect to the specified path.
	 **/
	Serial.prototype.connect = function(aPath, aOptions) {
		var deferred = $q.defer();
		if (this.connection) {
			this.disconnect();
		}
		var self = this;
		aOptions = aOptions || Serial.ConnectionOptions;

		var connected = function(aInfo) {
			// Check for failure, like trying to connect
			// to a device no longer plugged in.
			if (chrome.runtime.lastError || !aInfo) {
				console.warn("Unable to connect to %s, there may already be a connection open.", aPath);
				deferred.reject();
			} else {
				self.connection = aInfo;

				if (self.debug) {
					console.info("Connected: ", aInfo);
				}
				if (!self.api.onReceive.hasListeners()) {
					self.api.onReceive.addListener(self.boundOnReceive);
				}
				if (!self.api.onReceiveError.hasListeners()) {
					self.api.onReceiveError.addListener(self.boundOnReceiveError);
				}
				self.onConnect.dispatch();
				deferred.resolve();
			}
		};

		var connect = function() {
			if (!aPath && self.ports.length) {
				aPath = self.ports[0].path;
			}

			if (!aPath) {
				deferred.reject(new Error("No path found"));
			}

			if (self.debug) {
				console.info("Connecting", aPath, aOptions);
			}

			self.api.connect(aPath, aOptions, connected);
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
	Serial.prototype.sendDataUntil = function(aData, aUntilByte) {
		var buffer   = new ArrayBuffer(1024);
		var builder  = ArrayBufferFactory.Builder(buffer);
		var offset   = 0;
		var deferred = $q.defer();

		function readPart(aInfo) {
			for (var i = 0; i < aInfo.data.length; i++) {
				var byte = info.data[i];
				builder.setInt8(offset, byte);
				if (byte === aUntilByte) {
					var msg = builder.trim();
					deferred.resolve(msg);
					return true;
				}
				offset++;
			}
			return false;
		}

		this.listen(readPart, true);
		this.sendData(aData);

		return deferred.promise;
	};


	/**
	  * Load up the available ports
	  * Specify a filter function or regex to limit the list of ports
	 **/
	Serial.prototype.load = function(aFilter) {
		console.log("Serial-load");
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
		console.log("Serial-broadcast");
		var data = typeof aMsg !== 'object' ? ArrayBufferFactory.fromString(aMsg) : aMsg;
		var deferred = $q.defer();
		var self = this;
		//aTimeout = aTimeout || Serial.DefaultTimeout;

		if (!this.ports.length) {
			deferred.reject('No ports found');
			return deferred.promise;
		}

		if (this.debug) {
			console.info("Broadcasting", aMsg, "to", this.ports);
		}

		var remaining = this.ports.length;
		var connections = {};
		var input = {};

		var sent = function(aInfo) {
			if (aInfo.error) {
				console.error('Send failed', aInfo);
			}
		};

		var transmit = function(aPort) {
			self.api.connect(aPort.path, aOptions, function(aInfo) {
				if (chrome.runtime.lastError || !aInfo) {
					console.warn("Unable to connect to %s, there may already be a connection open.", aPort.path);
				} else {
					if (self.debug) {
						console.info("Sending broadcast", aInfo);
					}

					self.onConnect.dispatch();
					connections[aInfo.connectionId] = aPort.path;
					self.api.send(aInfo.connectionId, data, sent);
				}
			});
		};

		var received = function(aInfo) {
			//console.log("Received: ", aInfo, connections, input);
			var path = connections[aInfo.connectionId];
			if (!input[path]) {
				input[path] = aInfo.text;
			} else {
				input[path] += aInfo.text;
			}

			if (input[path].substr(input[path].length - 1) == '\n') {
				remaining--;
			}
			//console.log("Remaining: " + remaining);
			if (remaining === 0) {
				done();
			}
		};

		var flushed = function(aResult) {
			//console.info('Connection flushed', aResult);
		};

		var disconnected = function(aResult) {
			//console.info('Broadcast disconnected', aResult);
		};

		var done = function() {
			self.mute();
			self.api.onReceive.removeListener(self.boundOnReceive);
			self.api.onReceiveError.removeListener(self.boundOnReceiveError);
			for (var id in connections) {
				self.api.flush(parseInt(id), flushed);
				self.api.disconnect(parseInt(id), disconnected);
			}
			if (self.debug) {
				console.info("Collected", input);
			}
			deferred.resolve(input);
		};

		if (!this.api.onReceive.hasListeners()) {
			this.api.onReceive.addListener(this.boundOnReceive);
		}
		if (!this.api.onReceiveError.hasListeners()) {
			this.api.onReceiveError.addListener(this.boundOnReceiveError);
		}

		this.listen(received, true);
		/*if (!chrome.serial.onReceive.hasListeners()) {
			chrome.serial.onReceive.addListener(this.boundOnReceive);
		}
		if (!chrome.serial.onReceiveError.hasListeners()) {
			chrome.serial.onReceiveError.addListener(this.boundOnReceiveError);
		}*/

		//this.api.onReceiveError.addListener(receivedError);
		for (var i = 0; i < this.ports.length; i++) {
			//console.log("Transmit: ", this.ports[i]);
			transmit(this.ports[i]);
		}

		//$timeout(done, aTimeout);

		return deferred.promise;
	};


	return Serial;

}]);

})();
