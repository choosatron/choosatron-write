(function() {

'use strict';

angular.module('storyApp.utils').service('ChoosatronSerial', ['$q', 'Serial', 'Ymodem',

function ($q, Serial, Ymodem) {

	var CMD_CHANGE_MODE = 'c';
	var CMD_GET_INFO    = 'i';
	var CMD_SET_WIFI    = 'w';

	var CMD_WRITE_FLASHRAW     = 0x66;
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
	var CMD_DFU_MODE           = 0x16;

	var CMD_GET_VERSION        = 0x11;
	var CMD_GET_FLAG           = 0x12;
	var CMD_GET_VALUE          = 0x13;
	var CMD_GET_NAMES          = 0x14;
	var CMD_GET_STORYINFO      = 0x15;

	function ChoosatronSerial() {
		this.coreId = null;
		this.serial = new Serial();
		this.serial.debug = true;
		this.modem  = new Ymodem(this.serial);
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
				.then(processCoreIds)
				.catch(deferred.reject);
		}

		function processCoreIds(result) {
			console.info('Broadcast result', result);
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
		var deferred = $q.defer();
		var send = this.serial.send.bind(this.serial);
		var cmds = [ssid, type, pwd];
		var response = '';

		// Here, we need to time things just right. After the 'w'
		// command is sent, watch for the next  ': ' string, which
		// is the prompt for the next required input.
		function queue(info) {
			response += info.text;
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
		this.serial.send(CMD_SET_WIFI);

		return deferred.promise;
	};


	ChoosatronSerial.prototype.command = function(cmd) {
		var deferred = $q.defer();
		var self = this;
		function ready() {
			self.serial.send(cmd)
				.then(deferred.resolve)
				.catch(deferred.reject);
			return true;
		}
		this.serial.listen(ready);
		this.serial.send(CMD_CHANGE_MODE);
		return deferred.promise;
	};

	ChoosatronSerial.prototype.addStory = function(filename, buffer) {
		var deferred = $q.defer();
		var self = this;

		function ready() {
			self.modem.send(filename, buffer);
		}

		this.command(CMD_ADD_STORY)
			.then(ready)
			.catch(deferred.reject);

		return deferred.promise;
	};

	return ChoosatronSerial;
}

]);

})();
