angular.module('storyApp.storage')
.factory('BaseStorageEngine', ['$q', 'EventHandler',
function ($q, EventHandler) {
	return function BaseStorageEngine() {
		this.area = {};
		this.events = EventHandler.create('set', 'error');
		this.events.async = true;
		this.events.context = this;

		this.throttle = 750; // ms

		this.on = function(event, callback) {
			this.events.on(event, callback);
			return this;
		};

		this.getItem = function(key) {
			var deferred = $q.defer();
			deferred.resolve(this.area[key]);
			return deferred.promise();
		};

		this.setItem = function(key, value) {
			this.events.fire('set', key, value);
			this.area[key] = value;
		};
	}
}])

.factory('LocalStorageEngine', ['$q', 'EventHandler', 'BaseStorageEngine',
function($q, EventHandler, BaseStorageEngine) {
	return function LocalStorageEngine() {
		BaseStorageEngine.call(this, $q, EventHandler);

		this.area     =  window.localStorage;
		this.getItem  =  function(key) {
			var deferred = $q.defer();
			var result   = this.area.getItem(key);
			deferred.resolve(result);
			return deferred.promise;
		};

		this.setItem  =  function(key, value) {
			try {
				this.area.setItem(key, value);
				this.events.fire('set', key, value);
			}
			catch (e) {
				this.events.fire('error', e);
			}
		};
	}
}])

.factory('ChromeStorageEngine', ['$q', 'EventHandler', 'BaseStorageEngine',
function($q, EventHandler, BaseStorageEngine) {
	return function ChromeStorageEngine() {
		BaseStorageEngine.call(this, $q, EventHandler);

		this.area = chrome.storage.local;

		this.getItem  =  function(key) {
			var deferred = $q.defer();
			var events = this.events;
			var cb = function(items) {
				if (!chrome.runtime.lastError) {
					deferred.resolve(items[key]);
				}
				else {
					events.fire('error', chrome.runtime.lastError);
					deferred.fail();
				}
			};
			this.area.get(key, cb);
			return deferred.promise;
		}

		this.setItem  =  function(key, value) {
			var events = this.events;
			var obj = {};
			obj[key] = value;
			this.area.set(obj, function() {
				if (!chrome.runtime.lastError) {
					events.fire('set', key, value);
				}
				else {
					events.fire('error', chrome.runtime.lastError);
				}
			});
		}
	}
}])


.factory('ChromeSyncStorageEngine', ['$q', 'EventHandler', 'ChromeStorageEngine',
function($q, EventHandler, ChromeStorageEngine) {
	return function ChromeSyncStorageEngine() {
		ChromeStorageEngine.call(this, $q, EventHandler);
		this.area = chrome.storage.sync;

		// Each change within the throttle time bumps the save action out slightly.
		// Chrome.sync storage has a max sustained save operation of 10 writes/minute
		this.throttle = 6000; // ms
	}
}]);
