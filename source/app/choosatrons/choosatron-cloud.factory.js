(function() {

'use strict';

// Provides access to device features, such as claiming, naming, and pushing.
// This factory is essentially a wrapper for the spark.js methods.
angular.module('storyApp')
	.factory('ChoosatronCloud', ['$q', function($q) {

	function ChoosatronCloud(token) {
		this.loaded      = false;
		this.choosatrons = [];
		this.spark       = spark;
		this.spark.login({accessToken: token});
	}

	ChoosatronCloud.productId = 7;

	ChoosatronCloud.prototype.load = function(force) {
		var deferred = $q.defer();
		if (this.loaded && !force) {
			deferred.resolve();
			return deferred.promise;
		}

		var self = this;

		this.spark.listDevices()
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

		function done(data) {
			if (data && data.ok) {
				deferred.resolve(data);
			}
			else {
				deferred.reject(data);
			}
		}

		this.spark[method]
			.apply(this.spark, args)
			.then(done)
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
		return this.defer('claimCore', [coreId]);
	};

	ChoosatronCloud.prototype.remove = function(coreId) {
		this.defer('removeCore', [coreId]);
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
		return this.flash(coreId, [chrome.runtime.getURL('bin/choosatron-core.bin')]);
	};


	ChoosatronCloud.prototype.flash = function(coreId, files) {
		return this.defer('flashCore', [coreId, files]);
	};


	ChoosatronCloud.prototype.rename = function(coreId, name) {
		return this.defer('renameCore', [coreId, name]);
	};

	return ChoosatronCloud;
}]);

})();
