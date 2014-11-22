angular.module('storyApp.utils')
.factory('Usb', ['$q', 'Convert', function($q, Convert) {

	function Usb() {
		this.connections = null;
	}

	function Device(device) {
		this.device = device;
	}

	Usb.Device = Device;

	Usb.prototype.getAllowedDevices = function() {
		var manifest = chrome.runtime.getManifest();
		var perms = manifest.optional_permissions.find(function(perm) {
			return perm.usbDevices;
		});
		return perms && perms.usbDevices;
	};

	Usb.prototype.connect = function() {
		var SPARK_VID = 7504; // 0x1D50;
		var SPARK_CORE_SERIAL_PID = 24701; // 0x607D;
		var SPARK_CORE_DFU_PID = 24703; // 0x607F;
		var DEVICE_INFO = { "vendorId": SPARK_VID, "productId": SPARK_CORE_SERIAL_PID };

		var permissionObj = {permissions: [{'usbDevices': [DEVICE_INFO] }]};

		chrome.permissions.contains(permissionObj, function(result) {
			if (result) {
				gotPermission();
			} else {
				console.log('App not currently granted the "usbDevices" permission, requesting...');
				chrome.permissions.request(permissionObj, function(result) {
					if (result) {
						gotPermission();
					} else {
						console.log('App was not granted the "usbDevices" permission.');
						console.log(chrome.runtime.lastError);
					}
				});
			}
		});

		function gotPermission(result) {
			console.log("Got permission!");
			chrome.usb.findDevices(DEVICE_INFO, function(devices) {
				if (!devices || !devices.length) {
				  console.log('device not found');
				  return;
				}
				console.log('Found device: ' + devices[0].handle);
				console.log(devices[0]);
			});
		}

		/*var deferred = $q.defer();

		var allowed = this.getAllowedDevices();
		var processed = 0;

		function onConnect(connections) {
			if (connections) {
				this.connections = this.connections.concat(connections);
			}
			processed++;
			if (processed === allowed.length) {
				deferred.resolve(this.connections);
			}
		}

		function find(device) {
			chrome.usb.findDevices(device, onConnect.bind(this));
		}

		this.connections = [];
		allowed.forEach(find.bind(this));

		return deferred.promise;*/
	};
	Usb.prototype.write = function(str) {
		var deferred = $q.defer();

		if (!this.connection) {
			console.error('No connection found');
			deferred.reject('No connection');
			return deferred.promise;
		}

		var data = Convert.stringToArrayBuffer(str);
		chrome.usb.send(this.connection.connectionId, data, deferred.resolve(this));
		return deferred.promise;
	};

	return new Usb();
}]);
