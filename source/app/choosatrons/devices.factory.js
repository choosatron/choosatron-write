(function() {

'use strict';

// Provides access to device features, such as claiming, naming, and pushing.
// This factory is essentially a wrapper for the spark.js methods.
angular.module('storyApp')
	.factory('Devices', [function() {

	function Devices(token) {
		this.token = token;
		this.list = [];
	}

	Devices.prototype.each = function(callback, ctx) {
		ctx = ctx || this;
		for (var i=0; i<this.list.length; i++) {
			callback.call(ctx, this.list[i], i, this.list);
		}
	};

	Devices.prototype.load = function() {
		spark.accessToken = this.token;
		var self = this;
		return spark.listDevices()
		.then(function(devices) {
			self.list = devices;
		});
	};

	Devices.prototype.find = function(coreId) {
		for (var i=0; i<this.list.length; i++) {
			if (this.list[i].deviceId === coreId) {
				return this.list[i];
			}
		}
		return null;
	};

	Devices.prototype.claim = function(coreId) {
		spark.accessToken = this.token;
		return spark.claimCore(coreId);
	};

	return Devices;
}]);

})();
