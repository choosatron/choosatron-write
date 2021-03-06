(function() {
'use strict';

angular.module('storyApp.utils').service('ChoosatronSerial', ['$q', 'Serial', 'Ymodem', 'Choosatrons', 'Choosatron',
function ($q, Serial, Ymodem, Choosatrons, Choosatron) {

	var CMD_MODE = 'c';

	// Active the micro-controller's listening mode (flashing blue).
	var CMD_LISTENING_MODE = 'l';

	// Commands in the micro-controller's internal listening mode (flashing blue).
	var CMD_GET_INFO       = 'i'; // Device ID and firmware version will be returned.
	var CMD_SET_WIFI       = 'w'; // Begin WiFi setup
	var CMD_GET_MAC        = 'm'; // Get the wireless modules mac address
	var CMD_FLASH_FIRMWARE = 'f'; // Prepare to flash firmware over serial
	var CMD_CLEAR_WIFI     = 'x';

	var CMD_WRITE_FLASHRAW     = 0x02;
	var CMD_WRITE_FLASHEE      = 0x03;
	var CMD_KEYPAD_INPUT       = 0x04;
	var CMD_BUTTON_INPUT       = 0x05;
	var CMD_ADJUST_CREDITS     = 0x06;
	var CMD_SET_CREDITS        = 0x07;
	var CMD_ADD_STORY          = 0x08;
	var CMD_REMOVE_STORY       = 0x09;
	var CMD_REMOVE_ALL_STORIES = 0x0A;
	var CMD_MOVE_STORY         = 0x0B;
	var CMD_SET_FLAG           = 0x0C;
	var CMD_SET_VALUE          = 0x0D;
	var CMD_RESET_METADATA     = 0x0E;
	var CMD_ERASE_FLASH        = 0x0F;
	var CMD_REBOOT_UNIT        = 0x10;
	var CMD_DFU_MODE           = 0x11;

	var CMD_GET_VERSION        = 0x12;
	var CMD_GET_FLAG           = 0x13;
	var CMD_GET_VALUE          = 0x14;
	var CMD_GET_NAMES          = 0x15;
	var CMD_GET_STORY_INFO     = 0x16;
	var CMD_GET_CREDITS        = 0x17;

	function ChoosatronSerial() {
		this.firmwareInstalled = false;
		this.serial = new Serial();
		this.serial.debug = true;
		this.modem  = new Ymodem(this.serial);
	}

	ChoosatronSerial.prototype.destroy = function() {
		//this.serial.destroy();
	};

	// Connect to an existing Choosatron and switch to listening mode
	ChoosatronSerial.prototype.listen = function() {
		return this.serial.broadcast(CMD_MODE + CMD_LISTENING_MODE);
	};

	ChoosatronSerial.prototype.connectToId = function(aDeviceId) {
		var deferred = $q.defer();
		var self     = this;

		if (Choosatrons.getSerialDevice(aDeviceId)) {
			self.serial.connect(Choosatrons.getSerialDevice(aDeviceId).serialPath()).then(deferred.resolve).catch(function() {
				console.log("Failed to connect to: %s", aDeviceId);
				Choosatrons.removeSerialDevice(aDeviceId);
				return deferred.reject;
			});
		}
		return deferred.promise;
	};

	// Connects to the first Choosatron device found,
	// for setting up a new Choosatron.
	ChoosatronSerial.prototype.connect = function() {
		console.log("ChoosatronSerial-connect");

		var deferred = $q.defer();
		var self     = this;

		/*function loadPorts() {
			return self.serial.load('tty.usb');
		}

		function getDeviceId() {
			return self.serial.broadcast(CMD_MODE + CMD_GET_INFO)
				.then(processDeviceIds)
				.catch(deferred.reject);
		}

		function processDeviceIds(aResult) {
			console.info('Broadcast result', aResult);

			var saveDeviceId = function(aDeviceId) {
				deferred.resolve(aDeviceId);
			};

			for (var path in aResult) {
				var msg = aResult[path];
				var pattern = /\s([0-9a-f]{24})\s/;
				var match = pattern.exec(msg);
				if (match) {
					console.info('Found a device', path, msg, match);
					self.serial.connect(path).then(saveDeviceId(match[1]));
					return;
				}
			}

			deferred.reject();
		}*/

		this.scanForDevices().then(function(aDeviceList) {
			console.log("ChoosatronSerial-connect: ", aDeviceList);
			if (aDeviceList && aDeviceList.length > 0) {
				var device = aDeviceList[0];

				var saveDeviceId = function() {
					Choosatrons.addSerialDevice(device);
					deferred.resolve(device.deviceId());
				};
				self.serial.connect(device.serialPath()).then(saveDeviceId);
			} else {
				deferred.reject();
			}
		});


		//loadPorts().then(getDeviceId);
		return deferred.promise;
	};


	ChoosatronSerial.prototype.scanForDevices = function() {
		console.log("ChoosatronSerial-scanForDevices");
		var deferred = $q.defer();
		var self     = this;

		function loadPorts() {
			return self.serial.load('tty.usb');
		}

		function getDeviceId() {
			return self.serial.broadcast(CMD_MODE + CMD_GET_INFO)
				.then(processDeviceIds)
				.catch(deferred.reject);
		}

		function processDeviceIds(aResult) {
			var deviceList = [];
			for (var path in aResult) {
				var msg = aResult[path];
				var pattern = '';
				var match = null;
				var choosatron = new Choosatron();
				if (msg.substring(0, 2) == "CM") {
					pattern = /\s*([0-9])\:([0-9a-f]{24})\:([0-9])([0-9])([0-9])\s*/;
					match = pattern.exec(msg);
					if (match) {
						console.log(match);
						choosatron.serialPath(path);
						choosatron.productId(match[1]);
						choosatron.deviceId(match[2]);
						choosatron.setVersion(Number(match[3]), Number(match[4]), Number(match[5]));
						choosatron.isWired(true);
						choosatron.lastWired(new Date());
						console.log("New Choosatron: ", choosatron);
						deviceList.push(choosatron);
						//Choosatrons.addSerialDevice(choosatron);
					} else {
						console.warn("Unable to parse data received: " + msg);
						deferred.reject();
					}
				} else {
					pattern = /\s([0-9a-f]{24})\s/;
					match = pattern.exec(msg);
					if (match) {
						console.info('Found a device', path, msg, match);
						choosatron.serialPath(path);
						choosatron.deviceId(match[1]);
						deviceList.push(choosatron);
						//Choosatrons.addSerialDevice(choosatron);
						console.log("New Device: ", choosatron);
					} else {
						console.warn("Unable to parse data received: " + msg);
						deferred.reject();
					}
				}

			}
			deferred.resolve(deviceList);
		}

		loadPorts().then(getDeviceId);
		return deferred.promise;
	};

	// Add WiFi credentials
	ChoosatronSerial.prototype.wifi = function(aSsid, aType, aPwd) {
		var deferred = $q.defer();
		var send = this.serial.send.bind(this.serial);
		var cmds = [aSsid, aType, aPwd];
		var response = '';

		// Here, we need to time things just right. After the 'w'
		// command is sent, watch for the next  ': ' string, which
		// is the prompt for the next required input.
		function queue(aInfo) {
			response += aInfo.text;
			if (response.indexOf(': ') < 1) {
				return false;
			}

			response = '';
			send(cmds.shift() + '\n');

			if (cmds.length === 0) {
				console.info('Done with queue');
				deferred.resolve();
				return true;
			}

			return false;
		}

		this.serial.listen(queue);
		this.serial.send(CMD_MODE + CMD_SET_WIFI);

		return deferred.promise;
	};

	ChoosatronSerial.prototype.command = function(aCommand) {
		var deferred = $q.defer();
		var self = this;
		function ready() {
			self.serial.send(aCommand)
				.then(deferred.resolve)
				.catch(deferred.reject);
			return true;
		}
		this.serial.listen(ready);
		this.serial.send(CMD_MODE);
		return deferred.promise;
	};

	ChoosatronSerial.prototype.addStory = function(aFilename, aBuffer) {
		var deferred = $q.defer();
		var self = this;

		function ready() {
			self.modem.send(aFilename, aBuffer);
		}

		this.command(CMD_ADD_STORY)
			.then(ready)
			.catch(deferred.reject);

		return deferred.promise;
	};

	// Clear WiFi credentials
	ChoosatronSerial.prototype.clearWifi = function() {
		var deferred = $q.defer();
		var self = this;

		function ready() {
			self.modem.send(aFilename, aBuffer);
		}

		this.command(CMD_CLEAR_WIFI)
			.then(ready)
			.catch(deferred.reject);

		return deferred.promise;
	};

	return ChoosatronSerial;
}

]);

})();
