angular.module('storyApp.storage')
.factory('AutoSave', ['$timeout', 'EventHandler', function($timeout, EventHandler) {

	return function AutoSave($storage, $scope) {
		var events = EventHandler.create('error', 'saving', 'saved', 'throttling');
		events.async = true;
		events.context = this;

		$storage.on('error', function(e) {
			events.fire('error', e);
		});

		$storage.on('set', function(key, value) {
			events.fire('saved', key, value);
		});

		this.onSaving = function(callback) {
			events.on('saving', callback);
		};

		this.onThrottling = function(callback) {
			events.on('throttling', callback);
		}

		this.onSaved = function(callback) {
			events.on('saved', callback);
		};

		this.onError = function(callback) {
			events.on('error', callback);
		};

		/**
		 * Watches a particular model within the scope and saves to local storage
		 * whenever the model has changed and the time limit has elapsed
		**/
		this.watch = function(modelName, getKey, getValue) {

			// Each change within the throttle time bumps the save action out slightly.
			// Chrome.sync storage has a max sustained save operation of 10 writes/minute
			var throttle = $storage.engine.throttle || 6000; //ms

			// Keep track of the last save time for each key
			var lastSave = {};

			// Store a reference to the promise to save
			var savePromise = {};

			$scope.$watch(modelName, function(nv, ov, scope) {

				// No new value or old value, exit
				if (!nv && !ov) {
					return;
				}

				var key = getKey ? getKey(nv) : modelName;

				// No key returned, exit
				if (!key) {
					return;
				}

				// Clear any previously queued saves
				if (savePromise[key]) {
					$timeout.cancel(savePromise[key]);
				}

				var val = getValue ? getValue(nv) : nv;
				var save = function() {
					events.fire('saving', key, val);
					$storage.set(key, val);
					lastSave[key] = Date.now();
				};

				var lastTimeSave = lastSave[key];
				if (lastTimeSave && Date.now() - lastTimeSave < throttle) {
					// If we're within the throttle time, bump out the final save call
					// a little to prevent excessive autosaving.
					events.fire('throttling', key, throttle);
					savePromise[key] = $timeout(save, throttle);
					return;
				}

				save();
			}, true);
		};
	};
}]);
