(function() {

'use strict';

// Provides access to device features, such as claiming, naming, and pushing.
// This factory is essentially a wrapper for the spark.js methods.
angular.module('storyApp')
	.factory('ChoosatronCloud', ['$q', 'Spark', 'PRODUCT_IDS', function($q, Spark, PRODUCT_IDS) {

	function ChoosatronCloud(token) {
		this.loaded      = false;
		this.choosatrons = [];
		this.spark       = new Spark(token);
	}

	ChoosatronCloud.productId = PRODUCT_IDS.choosatron;
	ChoosatronCloud.argumentDelimeter = '|';

	ChoosatronCloud.prototype.load = function(force) {
		var deferred = $q.defer();
		if (this.loaded && !force) {
			deferred.resolve();
			return deferred.promise;
		}

		var self = this;

		this.spark.listDevicesWithAttributes()
		.then(function(devices) {
			self.choosatrons = devices;
			self.loaded = true;
			deferred.resolve();
		});

		return deferred.promise;
	};

	ChoosatronCloud.prototype.defer = function(method, args) {
		var deferred = $q.defer();
		args = args || [];

		console.info("Calling", method, args);
		this.spark[method]
			.apply(this.spark, args)
			.then(deferred.resolve)
			.catch(deferred.reject);

		return deferred.promise;
	};

	ChoosatronCloud.prototype.each = function(callback, ctx) {
		ctx = ctx || this;
		for (var i=0; i<this.choosatrons.length; i++) {
			callback.call(ctx, this.choosatrons[i], i, this.choosatrons);
		}
	};

	ChoosatronCloud.prototype.find = function(coreId) {
		for (var i=0; i<this.choosatrons.length; i++) {
			if (this.choosatrons[i].deviceId === coreId) {
				return this.choosatrons[i];
			}
		}
		return null;
	};

	ChoosatronCloud.prototype.claim = function(coreId) {
		return this.defer('claimCore', [coreId, ChoosatronCloud.productId]);
	};

	ChoosatronCloud.prototype.remove = function(coreId) {
		return this.defer('removeCore', [coreId]);
	};

	ChoosatronCloud.prototype.changeToChoosatron = function(coreId) {
		// @todo: Use a Spark object instead of the spark.api once the codebase is updated
		if (!this.spark.changeProduct) {
			var deferred = $q.defer();
			deferred.reject("Spark doesn't support changeProduct yet");
			return deferred.promise;
		}

		return this.defer('changeProduct', [coreId, ChoosatronCloud.productId, true]);
	};


	// Makes a choosatron by flashing its core with the stored binary
	ChoosatronCloud.prototype.flashAsChoosatron = function(coreId) {
		return this.flash(coreId, 'bin/choosatron-core.bin');
	};


	ChoosatronCloud.prototype.flash = function(coreId, file) {
		return this.defer('flashCore', [coreId, file]);
	};


	ChoosatronCloud.prototype.rename = function(coreId, name) {
		return this.defer('renameCore', [coreId, name]);
	};


	// Send a Choosatron command and listen for the response on an event stream
	ChoosatronCloud.prototype.request = function(coreId, method, args) {
		var deferred = $q.defer();
		var command  = this.command.bind(this);

		function notified(value) {
			console.info("notified", value);
			if (value !== 'open') {
				return;
			}
			command(coreId, method, args);
		}

		this.spark.listen(coreId, method)
		.then(deferred.resolve, deferred.reject, notified);

		return deferred.promise;
	};


	// Send a Choosatron command to a device
	ChoosatronCloud.prototype.command = function(coreId, method, args) {
		args = args || '';
		if (Array.isArray(args)) {
			args = args.join(ChoosatronCloud.argumentDelimeter);
		}
		if (args.length) {
			args = ChoosatronCloud.argumentDelimeter + args;
		}
		args = method + args;
		return this.defer('callFunction', [coreId, 'command', args]);
	};


	ChoosatronCloud.prototype.getIpAddress = function(coreId) {
		return this.command(coreId, 'get_local_ip');
	};

	return ChoosatronCloud;
}]);

})();
