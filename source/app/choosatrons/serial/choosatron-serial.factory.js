(function() {

'use strict';

angular.module('storyApp.utils').service('ChoosatronSerial', ['$q', 'Serial',

function ($q, Serial) {

	var CMD_CHANGE_MODE = 'c';
	var CMD_GET_INFO    = 'i';
	var CMD_SET_WIFI    = 'w';

	function ChoosatronSerial() {
		this.coreId = null;
		this.serial = new Serial();
		this.serial.debug = true;
	}

	ChoosatronSerial.prototype.destroy = function() {
		this.serial.destroy();
	};

	// Connect to an existing Choosatron and switch to listening mode
	ChoosatronSerial.prototype.listen = function() {
		return this.serial.broadcast(CMD_CHANGE_MODE);
	};

	// Connects to the first Choosatron device that is in listening mode
	ChoosatronSerial.prototype.connect = function() {
		var deferred = $q.defer();
		var self     = this;

		function loadPorts() {
			return self.serial.load('usb');
		}

		function getCoreId() {
			return self.serial.broadcast(CMD_GET_INFO)
				.then(processCoreIds);
		}

		function processCoreIds(result) {
			for (var path in result) {
				var msg = result[path];
				var pattern = /\s([0-9a-f]{24})\s/;
				var match = pattern.exec(msg);
				if (match) {
					console.info('Found a spark core', path, msg);
					self.coreId = match[1];
					self.serial.connect(path)
						.then(deferred.resolve);
					return;
				}
			}
			deferred.reject();
		}

		loadPorts().then(getCoreId);
		return deferred.promise;
	};

	// Add WiFi credentials
	ChoosatronSerial.prototype.wifi = function(ssid, type, pwd) {
		return this.serial.sendMultiple([CMD_SET_WIFI, ssid, type, pwd]);
	};

	return ChoosatronSerial;
}

]);

})();
