angular.module('storyApp.storage')
.factory('AutoSave', ['$timeout', 'EventHandler', function($timeout, EventHandler) {

	return function AutoSave($storage, $scope) {
		var events = EventHandler.create('error', 'saving', 'saved', 'throttling');
		events.async = true;
		events.context = this;

		$storage.on('error', function(e) {
			events.fire('error', e);
		});

		// Each change within the throttle time bumps the save action out slightly.
		// Chrome.sync storage has a max sustained save operation of 10 writes/minute
		var throttle = $storage.engine.throttle || 6000; //ms

		// Keep track of the last save time for each key
		var lastSave = {};

		// Store a reference to the promise to save
		var savePromise = {};

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

		this.save = function(key, val) {
			// No key returned, exit
			if (!key) {
				return;
			}

			// Clear any previously queued saves
			if (savePromise[key]) {
				$timeout.cancel(savePromise[key]);
			}

			var doSave = function() {
				events.fire('saving', key, val);
				$storage.set(key, val)
				.then(function() {
					events.fire('saved', key, val);
					lastSave[key] = Date.now();
				});
			};

			var lastTimeSave = lastSave[key];
			if (lastTimeSave && Date.now() - lastTimeSave < throttle) {
				// If we're within the throttle time, bump out the final save call
				// a little to prevent excessive autosaving.
				events.fire('throttling', key, throttle);
				savePromise[key] = $timeout(doSave, throttle);
				return;
			}

			doSave();
		};

		/**
		 * Watches a particular model within the scope and saves to local storage
		 * whenever the model has changed and the time limit has elapsed
		**/
		this.watch = function(modelName, getKey, getValue) {

			var save = this.save.bind(this);

			$scope.$watch(modelName, function(nv, ov) {
				if (nv === ov) {
					return;
				}

				var key = getKey ? getKey(nv) : modelName;
				var val = getValue ? getValue(nv) : nv;
				save(key, val);
			}, true);
		};
	};
}]);
