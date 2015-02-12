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
		var deferred = $q.defer();

		this.spark.claimCore(coreId)
		.then(deferred.resolve)
		.catch(deferred.reject);

		return deferred.promise;
	};

	ChoosatronCloud.prototype.changeToChoosatron = function(coreId) {
		// @todo: Use a Spark object instead of the spark.api once the codebase is updated
		var deferred = $q.defer();

		function changed(data) {
			if (data && !data.ok) {
				console.error('Error changing to Choosatron', data);
				return deferred.reject(data);
			}
			console.info('Changed to Choosatron', data);
			deferred.resolve();
		}

		console.info('Changing core to Choosatron', coreId);
		this.spark.api.changeProduct(coreId, ChoosatronCloud.productId, true, this.token, changed);

		return deferred.promise;
	};


	ChoosatronCloud.prototype.flash = function(coreId, files) {
		var deferred = $q.defer();

		function flashed(data) {
			if (data && data.ok) {
				deferred.resolve(data);
			}
			else {
				deferred.reject(data);
			}
		}

		this.spark.flashCore(coreId, files, flashed);

		return deferred.promise;
	};

	return ChoosatronCloud;
}]);

})();
