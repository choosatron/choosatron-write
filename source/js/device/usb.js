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
		var deferred = $q.defer();

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

		return deferred.promise;
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
