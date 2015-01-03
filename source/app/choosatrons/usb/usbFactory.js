angular.module('storyApp.utils')
.factory('Usb', ['$q', 'Convert', function($q, Convert) {

	function Usb() {
		this.connections = null;
		this.serialDevices = [];
		this.dfuDevices = [];
		this.allowedDevices = this.getAllowedDevices();
		this.setHasPermissions(false);
		/*this.getAllowedDevices().then(function(devices) {
			this.allowedDevices = devices;
			console.log(this.allowedDevices);
		});*/
		//this.checkPermissions();



		/*Usb.prototype.setHasPermissions = function(aHasPermissions) {
			//this.hasPermissions = aHasPermissions;
		};*/
	}

	/*function Device(device) {
		this.device = device;
	}*/

	//Usb.Device = Device;

	//Usb.devices = [];

	/*Usb.prototype.permission = function() {
		return this.hasPermission;
	};*/

	Usb.prototype.getHasPermissions = function() {
		console.log("Perm: " + this.hasPermissions);
		return this.hasPermissions;
	};

	Usb.prototype.setHasPermissions = function(aHasPermissions) {
		this.hasPermissions = aHasPermissions;
	};

	Usb.prototype.deviceList = function() {
		return this.devices;
	};

	Usb.prototype.getAllowedDevices = function() {
		var manifest = chrome.runtime.getManifest();
		var perms = manifest.optional_permissions.find(function(perms) {
			return perms.usbDevices;
		});
		return perms && perms.usbDevices;
	};

	Usb.prototype.checkPermissions = function() {
		var deferred = $q.defer();
		var scope = this;

		console.log("Checking permissions...");
		var permissionObj = {permissions: [{'usbDevices': this.allowedDevices }]};
		chrome.permissions.contains(permissionObj, function(result) {
			console.log("Permission: " + result);
			scope.setHasPermissions(result);
			deferred.resolve(result);
		});

		return deferred.promise;
	};

	Usb.prototype.requestPermissions = function() {
		var deferred = $q.defer();
		var scope = this;

		this.checkPermissions().then(function(result) {
			if (!result) {
				console.log("Requesting permissions...");
				var permissionObj = {permissions: [{'usbDevices': scope.allowedDevices }]};
				chrome.permissions.request(permissionObj, function(result) {
					console.log("Permission: " + result);
					scope.setHasPermissions(result);
					deferred.resolve(result);
				});
			}
		});

		return deferred.promise;
	};

	Usb.prototype.removePermissions = function() {
		var deferred = $q.defer();
		var scope = this;

		console.log("Removing permissions...");
		var permissionObj = {permissions: [{'usbDevices': this.allowedDevices }]};
		chrome.permissions.remove(permissionObj, function(result) {
			if (result) {
				console.log("Permissions removed.");
			} else {
				console.log("Unable to remove permissions.");
			}
			deferred.resolve(result);
		});

		return deferred.promise;
	};

	Usb.prototype.updateSerialDeviceList = function() {
		/*chrome.serial.getDevices(function(ports) {
			for (var i=0; i<ports.length; i++) {
				console.log(ports[i].path);
			}
		});*/
		if (this.hasPermissions) {
			var scope = this;
			// Index 0 is the Spark Core in Serial Mode
			chrome.usb.getDevices(this.allowedDevices[0], function(devices) {
				scope.serialDevices = [];
				if (!devices || !devices.length) {
				  //console.log('device not found');
				  return;
				}
				devices.forEach(function(element, index, array) {
					console.log("Serial Device: ");
					console.log(element);
					scope.serialDevices.push(element);
				});
				//console.log('Found Serial Device: ' + devices[0]);
			});
		}
	};

	Usb.prototype.updateDfuDeviceList = function() {
		if (this.hasPermissions) {
			var scope = this;
			// Index 1 is the Spark Core in DFU Mode
			chrome.usb.getDevices(this.allowedDevices[1], function(devices) {
				scope.dfuDevices = [];
				if (!devices || !devices.length) {
				  return;
				}
				devices.forEach(function(element, index, array) {
					console.log("DFU Device: ");
					console.log(element);
					scope.dfuDevices.push(element);
				});
				//console.log('Found DFU Device: ' + devices[0]);
			});
		}
	};

	Usb.prototype.connected = function() {
		return false;
	};

	Usb.prototype.connect = function() {
		//var SPARK_VID = 7504; // 0x1D50;
		//var SPARK_CORE_SERIAL_PID = 24701; // 0x607D;
		//var SPARK_CORE_DFU_PID = 24703; // 0x607F;
		//var DEVICE_INFO = { "vendorId": SPARK_VID, "productId": SPARK_CORE_SERIAL_PID };

		//var permissionObj = {permissions: [{'usbDevices': this.getAllowedDevices() }]};

		function gotPermission(allowed, result) {
			console.log("Got permission!");
			chrome.usb.findDevices(allowed, function(devices) {
				if (!devices || !devices.length) {
				  console.log('device not found');
				  return;
				}
				console.log('Found device: ' + devices[0].handle);
				console.log(devices[0]);
			});
		}

		chrome.permissions.contains(this.allowedDevices, function(result) {
			if (result) {
				gotPermission(this.allowedDevices);
			} else {
				console.log('App not currently granted the "usbDevices" permission, requesting...');
				chrome.permissions.request(this.allowedDevices, function(result) {
					if (result) {
						gotPermission(this.allowedDevices);
					} else {
						console.log('App was not granted the "usbDevices" permission.');
						console.log(chrome.runtime.lastError);
					}
				});
			}
		});


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

	return Usb;
}]);
