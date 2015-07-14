(function() {

'use strict';

// Provides access to device features, such as claiming, naming, and pushing.
// This factory is essentially a wrapper for the particle.js methods.
angular.module('storyApp')
	.factory('ChoosatronCloud', ['$q', 'Particle', 'PRODUCT_IDS',
		function($q, Particle, PRODUCT_IDS) {

	function ChoosatronCloud(aToken) {
		this.loaded      = false;
		this.choosatrons = [];
		this.particle       = new Particle(aToken);
	}

	ChoosatronCloud.serverCode = {
		notImplemented : -6,
		maxReached     : -5,
		invalidIndex   : -4,
		busy           : -3,
		invalidCmd     : -2,
		fail           : -1,
		success        : 0,
		eventIncoming  : 1,
		connecting     : 2
	};

	ChoosatronCloud.productId = PRODUCT_IDS.choosatron;
	ChoosatronCloud.argumentDelimeter = '|';

	ChoosatronCloud.prototype.load = function(force) {
		var deferred = $q.defer();
		if (this.loaded && !force) {
			deferred.resolve();
			return deferred.promise;
		}

		var self = this;

		this.particle.listDevicesWithAttributes()
		.then(function(devices) {
			self.choosatrons = devices;
			self.loaded = true;
			deferred.resolve();
		});

		return deferred.promise;
	};

	ChoosatronCloud.prototype.defer = function(aMethod, aArgs) {
		var deferred = $q.defer();
		aArgs = aArgs || [];

		console.info("Calling", aMethod, aArgs);
		this.particle[aMethod]
			.apply(this.particle, aArgs)
			.then(deferred.resolve)
			.catch(deferred.reject);

		return deferred.promise;
	};

	ChoosatronCloud.prototype.each = function(aCallback, aCtx) {
		aCtx = aCtx || this;
		for (var i = 0; i < this.choosatrons.length; i++) {
			aCallback.call(aCtx, this.choosatrons[i], i, this.choosatrons);
		}
	};

	ChoosatronCloud.prototype.find = function(aId) {
		for (var i = 0; i < this.choosatrons.length; i++) {
			if (this.choosatrons[i].getDeviceId() === aId) {
				return this.choosatrons[i];
			}
		}
		return null;
	};

	ChoosatronCloud.prototype.claim = function(aId) {
		return this.defer('claimCore', [aId, ChoosatronCloud.productId]);
	};

	ChoosatronCloud.prototype.remove = function(aId) {
		return this.defer('removeCore', [aId]);
	};

	ChoosatronCloud.prototype.changeToChoosatron = function(aId) {
		// @todo: Use a Particle object instead of the particle.api once the codebase is updated
		if (!this.particle.changeProduct) {
			var deferred = $q.defer();
			deferred.reject("Particle doesn't support changeProduct yet");
			return deferred.promise;
		}

		return this.defer('changeProduct', [aId, ChoosatronCloud.productId, true]);
	};


	// Makes a choosatron by flashing its core with the stored binary
	ChoosatronCloud.prototype.flashAsChoosatron = function(aId) {
		return this.flash(aId, 'bin/choosatron-core.bin');
	};


	ChoosatronCloud.prototype.flash = function(aId, aFile) {
		return this.defer('flashCore', [aId, aFile]);
	};


	ChoosatronCloud.prototype.rename = function(aId, aName) {
		return this.defer('renameCore', [aId, aName]);
	};


	// Send a Choosatron command and listen for the response on an event stream
	ChoosatronCloud.prototype.request = function(aId, aMethod, aArgs) {
		var deferred = $q.defer();
		var command  = this.command.bind(this);

		function notified(aReponse) {
			console.info("notified", aResponse.event);
			if (aResponse.event !== 'open') {
				return;
			}
			command(aId, aMethod, aArgs);
		}

		this.particle.listen(aId, aMethod)
		.then(deferred.resolve, deferred.reject, notified);

		return deferred.promise;
	};


	// Send a Choosatron command to a device
	ChoosatronCloud.prototype.command = function(aId, aMethod, aArgs) {
		aArgs = aArgs || '';
		if (Array.isArray(aArgs)) {
			aArgs = aArgs.join(ChoosatronCloud.argumentDelimeter);
		}
		if (aArgs.length) {
			aArgs = ChoosatronCloud.argumentDelimeter + aArgs;
		}
		aArgs = aMethod + aArgs;
		return this.defer('callFunction', [aId, 'command', aArgs]);
	};


	ChoosatronCloud.prototype.getIpAddress = function(aId) {
		return this.command(aId, 'get_local_ip');
	};


	// Gets all of the story information by looping through indices
	// until the core responds with an invalid index result
	ChoosatronCloud.prototype.getStoryInfo = function(aId) {
		var deferred = $q.defer();
		var cmd = 'get_story_info';
		var stories = [];
		var particle = this.particle;

		function loadNextStory() {
			console.log("Request story index: %d", stories.length);
			/*jshint -W087 */
			//debugger;

			// TODO: Need to catch a response error HERE, not from the listener.
			// If an index is bad, we get that response right away!
			particle.callFunction(aId, cmd, ['0' + stories.length])
			.catch(deferred.reject);
		}

		function saveInfo(aResponse) {
			/*jshint -W087 */
			//debugger;
			if (typeof aResponse.data === 'number' && aResponse.data < ChoosatronCloud.serverCode.success) {
				aResponse.source.close();
				if (rsp.data === ChoosatronCloud.serverCode.invalidIndex) {
					return deferred.resolve(stories);
				}
				else {
					return deferred.reject(aResponse);
				}
			}
			stories.push(aResponse.data);
			loadNextStory();
		}

		this.particle.listen(aId, cmd, true)
			.then(deferred.resolve, deferred.reject, saveInfo);

		loadNextStory();

		return deferred.promise;
	};

	return ChoosatronCloud;
}]);

})();
