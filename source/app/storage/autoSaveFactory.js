angular.module('storyApp.storage')
.factory('autoSave', ['$timeout', function($timeout) {

	function autoSave(storage, $scope) {
		this.storage = storage;
		this.scope = $scope;

		this.events = {
			'error':    []
			, 'saving': []
			, 'saved':  []
		};

		// Each change within the throttle time bumps the save action out slightly.
		// Chrome.sync storage has a max sustained save operation of 10 writes/minute
		this.throttle = $storage.engine.throttle || 6000; //ms

		// Store a reference to the promise to save
		this.queue = {};

		storage.on('error', (function(e) {
			this._fire('error', e);
		}).bind(this));
	}

	AutoSave.prototype._fire = function() {
		var name = arguments[0];
		if (this.events[name].length === 0) {
			return;
		}

		var ctx = this;
		var args = Array.prototype.slice.call(arguments, 1);
		for (var i=0; i<this.events[name].length; i++) {
			this.events[name][i](args);
		}
	};

	AutoSave.prototype.onSaving = function(callback) {
		this.events['saving'].push(callback.bind(this));
	};

	AutoSave.prototype.onSaved = function(callback) {
		this.events['saved'].push(callback.bind(this));
	};

	AutoSave.prototype.onError = function(callback) {
		this.events['error'].push(callback.bind(this));
	};

	AutoSave.prototype.save = function(key, val) {
		// No key returned, exit
		if (!key) {
			return;
		}

		var doSave = function() {
			this._fire('saving', key, val);
			this.storage.set(key, val)
			.then((function() {
				this._fire('saved', key, val);
			}).bind(this));
		};

		doSave = doSave.bind(this);

		// Clear the previously queued save
		if (this.queue[key]) {
			$timeout.cancel(this.queue[key]);
		}

		// Queue up another save to occur after the throttle time has passed
		this.queue[key] = $timeout(doSave, this.throttle, false);
	};

	return AutoSave;
}]);
