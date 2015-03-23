/**
 * Implementation of the X/YModem protocol over serial.
 * @see http://textfiles.com/programming/ymodem.txt
 *
 * 1024 byte packets 
 *  SENDER				  RECEIVER
						  "s -k	foo.bar"
	  "foo.bar open	x.x minutes"
						  C
	  STX 01 FE Data[1024] CRC CRC
						  ACK
	  STX 02 FD Data[1024] CRC CRC
						  ACK
	  STX 03 FC Data[1000] CPMEOF[24] CRC CRC
						  ACK
	  EOT
						  ACK
**/
(function() {

'use strict';

angular.module('storyApp.utils').service('Ymodem', ['$q', '$timeout', 'Serial',
function($q, $timeout, Serial) {

	var SOH = 0x01;
	var STX = 0x02;
	var EOT = 0x04;
	var ACK = 0x06;
	var NAK = 0x15;
	var CAN = 0x18;
	var C   = 0x43;

	function Ymodem(serial) {
		this.serial = serial;
	}

	// Provides a 2-byte CRC (Cyclical Redundancy Check)
	Ymodem.prototype.crc = function(offset, length, buffer) {
		var view = new Int16Array(buffer);
		var crc = 0;
		for (var i=offset; i<length; i++) {
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

}]);

})();
