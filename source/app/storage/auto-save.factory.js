angular.module('storyApp.storage')
.factory('AutoSave', ['$timeout', function($timeout) {

	function AutoSave(aStorage, $scope) {
		this.storage = aStorage;
		this.scope = $scope;

		this.events = {
			'error' : [],
			'saving': [],
			'saved' : []
		};

		// Each change within the throttle time bumps the save action out slightly.
		// Chrome.sync storage has a max sustained save operation of 10 writes/minute
		this.throttle = aStorage.engine.throttle || 6000; //ms

		// Store a reference to the promise to save
		this.queue = {};

		aStorage.on('error', (function(e) {
			this._fire('error', e);
		}).bind(this));
	}

	AutoSave.prototype._fire = function() {
		var name = arguments[0];
		console.log("AutoSave event", arguments);
		if (this.events[name].length === 0) {
			return;
		}

		var ctx = this;
		var args = Array.prototype.slice.call(arguments, 1);
		for (var i = 0; i < this.events[name].length; i++) {
			this.events[name][i](args);
		}
	};

	AutoSave.prototype.onSaving = function(aCallback) {
		this.events.saving.push(aCallback.bind(this));
	};

	AutoSave.prototype.onSaved = function(aCallback) {
		this.events.saved.push(aCallback.bind(this));
	};

	AutoSave.prototype.onError = function(aCallback) {
		this.events.error.push(aCallback.bind(this));
	};

	AutoSave.prototype.save = function(aKey, aVal) {
		// No key returned, exit
		if (!aKey) {
			return;
		}

		console.log("Save: ", aVal);
		var doSave = function() {
			this._fire('saving', aKey, aVal);
			console.log("SAVING: ", aKey, aVal);
			this.storage.set(aKey, aVal)
			.then((function() {
				this._fire('saved', aKey, aVal);
			}).bind(this));
		};

		doSave = doSave.bind(this);

		// Clear the previously queued save
		if (this.queue[aKey]) {
			$timeout.cancel(this.queue[aKey]);
		}

		// Queue up another save to occur after the throttle time has passed
		this.queue[aKey] = $timeout(doSave, this.throttle, false);
	};

	return AutoSave;
}]);
