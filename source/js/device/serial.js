angular.module('storyApp.utils')
.factory('Serial', ['$q', 'Convert', function($q, Convert) {
	function Serial() {
		this.connection = null;
	}

	Serial.prototype.getDevices = function() {
		var deferred = $q.defer();
		chrome.serial.getDevices(deferred.resolve.bind(this));
		return deferred.promise;
	};

	Serial.prototype.connect = function(path, opts) {
		opts = opts || {};

		var deferred = $q.defer();

		function onConnect(info) {
			this.connection = info;
			deferred.resolve(info);
		}

		function execute() {
			chrome.serial.connect(path, opts, onConnect.bind(this));
		}

		if (this.connection) {
			// Disconnect first
			this.disconnect(execute.bind(this));
		}
		else {
			execute.call(this);
		}

		return deferred.promise;
	};

	Serial.prototype.disconnect = function() {
		var deferred = $q.defer();
		var id = this.connection && this.connection.connectionId;

		if (!id) {
			deferred.resolve();
			return deferred.promise;
		}

		function onDisconnect(result) {
			this.connection = null;
			if (result) {
				deferred.resolve(result);
			}
			else {
				deferred.reject('Disconnect failed.');
			}
		}

		chrome.serial.disconnect(id, onDisconnect.bind(this));

		return deferred.promise;
	};

	Serial.prototype.listen = function(callback) {
		var content = '';
		function received(info) {
			if (!info || !info.data || info.connectionId !== this.connection.connectionId) {
				return;
			}
			var str = Convert.arrayBufferToString(info.data);
			content += str;
			if (str.charAt(str.length -1) === '\n') {
				if (callback) {
					callback(content);
				}
				content = '';
			}
		}
		chrome.serial.onReceive.addListener(received.bind(this));
		return deferred.promise;
	};

	Serial.prototype.write = function(str) {
		var deferred = $q.defer();

		if (!this.connection) {
			console.error('No connection found');
			deferred.reject('No connection');
			return deferred.promise;
		}

		var data = Convert.stringToArrayBuffer(str);
		chrome.serial.send(this.connection.connectionId, data, deferred.resolve(this));
		return deferred.promise;
	};

	return Serial;
}]);
