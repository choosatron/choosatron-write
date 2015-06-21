/**
 * Implementation of the X/YModem protocol over serial.
 * @see http://textfiles.com/programming/ymodem.txt
 * @see https://code.google.com/p/xtreamerdev/source/browse/trunk/rtdsr/ymodem.c?r=2
**/
(function() {

'use strict';

angular.module('storyApp.utils').service('Ymodem', ['$q', 'ArrayBufferFactory', 'Serial',
function($q, ArrayBufferFactory, Serial) {

	function Ymodem(serial) {
		this.serial = serial;
		this.maxRetries = 3;
	}

	var SOH = Ymodem.SOH = 0x01;
	var STX = Ymodem.STX = 0x02;
	var EOT = Ymodem.EOT = 0x04;
	var ACK = Ymodem.ACK = 0x06;
	var NAK = Ymodem.NAK = 0x15;
	var CAN = Ymodem.CAN = 0x18;
	var CRC = Ymodem.CRC = 0x43;

	var PACKET_HEADER    = 3; // start, block, block complement
	var PACKET_TRAILER   = 2; // CRC
	var HEADER_SIZE      = 128;
	var BLOCK_SIZE       = 1024;

	Ymodem.prototype.send = function(filename, buffer) {
		return this.sendHeader(filename)
			.then(this.sendBody.bind(this, buffer))
			.then(this.end.bind(this));
	};

	Ymodem.prototype.sendHeader = function(filename) {
		filename   = filename.slice(0, HEADER_SIZE);
		var data   = ArrayBuffer.fromString(filename);
		var packet = this.buildPacket(0, data);

		return this.serial.sendDataUntil(packet, CRC);
	};

	Ymodem.prototype.sendBody = function(buffer) {
		var size = BLOCK_SIZE;
		var blockNumber = 0;
		var blockCount  = Math.ceil(buffer.byteLength / size);

		var deferred = $q.defer();
		var self     = this;

		function nextBlock() {
			blockNumber++;
			if (blockNumber >= blockCount) {
				deferred.resolve();
			}
			var block = buffer.slice((blockNumber - 1) * size, size);
			self.sendBlock(blockNumber, block).then(nextBlock);
		}

		nextBlock();

		return deferred.promise;
	};

	Ymodem.prototype.sendBlock = function(number, buffer) {
		var deferred = $q.defer();
		var packet   = this.buildPacket(number, buffer);
		var send     = this.serial.sendData.bind(this.serial, packet);
		var self     = this;
		var tries    = 0;

		function listener(info) {
			for (var i=0; i<info.data.length; i++) {
				var byte = info.data[i];
				if (byte === NAK) {
					// Retry submission on NAK
					tries++;
					if (tries > self.maxTries) {
						self.abort();
						deferred.reject();
						return false;
					}
					send();
					return false;
				}
				else if (byte === ACK) {
					deferred.resolve();
					return true;
				}
			}
			return false;
		}

		this.serial.listen(listener);
		send();

		return deferred.promise;
	};

	Ymodem.prototype.end = function() {
		return this.serial.sendDataUntil(EOT, NAK)
			.then(this.serial.sendDataUntil.bind(this.serial, EOT, ACK));
	};

	Ymodem.prototype.abort = function() {
		var cancan = new ArrayBuffer(2);
		var view   = new Int8Array(cancan);
		view[0]    = CAN;
		view[1]    = CAN;
		return this.serial.sendData(cancan);
	};

	Ymodem.prototype.buildPacket = function(number, buffer) {
		var size  = (number === 0) ? HEADER_SIZE : BLOCK_SIZE;
		var start = (number === 0) ? SOH : STX;
		var crc   = this.crc(buffer, size);

		var builder = ArrayBufferFactory.Builder(size + PACKET_HEADER + PACKET_TRAILER);
		builder.setInt8(0, start);
		builder.setInt8(1, number & 0xFF);
		builder.setInt8(2, ~number & 0xFF);
		builder.setData(3, buffer);
		builder.setInt16(PACKET_HEADER + size, crc);

		return builder.buffer;
	};

	// Provides a 2-byte CRC (Cyclical Redundancy Check)
	Ymodem.prototype.crc = function(buffer, size) {
		var view = new Int16Array(buffer);
		var crc = 0;
		for (var i=0; i<size; i++) {
			var byte = view[i];
			crc = crc ^ (byte << 8);
			for (var y=0; i<8; y++) {
				if (crc & 0x8000) {
					crc = crc << 1 ^ 0x1021;
				}
				else {
					crc = crc << 1;
				}
			}
		}
		return (crc & 0xFFFF);
	};

	return Ymodem;

}]);

})();
