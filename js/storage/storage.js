// Wrapped in an anonymous function to allow local namepsacing
(function() {

function StorageEngineProvider() {

	var preferSync = false;

	this.preferSyncStorage = function(value) {
		if (value) {
			console.info("Preferring sync storage");
		}
		preferSync = value;
	};

	this.$get = function($q, EventHandler) {
		if (chrome && chrome.storage && preferSync) {
			return new ChromeSyncStorageEngine($q, EventHandler);
		}
		else if (chrome && chrome.storage) {
			return new ChromeStorageEngine($q, EventHandler);
		}
		else if (window.localStorage) {
			return new LocalStorageEngine($q, EventHandler);
		}
		return new BaseStorageEngine($q, EventHandler);
	}
};

function BaseStorageEngine($q, EventHandler) {
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

function LocalStorageEngine($q, EventHandler) {
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

function ChromeStorageEngine($q, EventHandler) {
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

function ChromeSyncStorageEngine($q, EventHandler) {
	ChromeStorageEngine.call(this, $q, EventHandler);
	this.area = chrome.storage.sync;

	// Each change within the throttle time bumps the save action out slightly.
	// Chrome.sync storage has a max sustained save operation of 10 writes/minute
	this.throttle = 6000; // ms
}


function StorageProvider() {
	return Storage;
};

function Storage(engine, namespace) {
	this.engine = engine;
	this.namespace = namespace;
	this.handlers = {};

	this.encode = function(val) {
		return angular.toJson(val);
	};

	this.decode = function(val) {
		if (!val || val.length == 0) {
			return {};
		}
		try {
			return angular.fromJson(val);
		}
		catch (e) {
			if (console) console.error("Error decoding", val);
			return {};
		}
	};

	/**
	 ** Passes through event handling to the StorageEngine.
	 **/
	this.on = function(event, callback) {
		this.engine.on(event, callback);
	};

	this.error = function() {
		this.engine.events.fire('error', arguments);
	};

	/**
	 * Operates much like the jQuery.data method.
	 * With no arguments, returns a promise that will resolve with all of the items in the namespace
	 * With 1 argument, returns a promise that will resolve with value stored in that key
	 * With 2 arguments, sets the key on the list to the specified value;
	**/
	this.data  =  function() {
		if (!this.engine) return null;
		var promise = this.engine.getItem(this.namespace);
		var decode  = this.decode;
		var err     = this.error;
		switch (arguments.length) {
			case 1:
				var key = arguments[0];
				return promise.then(function(items) {
					var data = decode(items);
					return data[key];
				}, err);
			case 2:
				var key = arguments[0];
				var val = arguments[1];
				if (!key) {
					if (console) console.trace("Attempt to save with undefined key", arguments);
					return;
				}
				var encode = this.encode;
				var engine = this.engine;
				var namespace = this.namespace;
				return promise.then(function(items) {
					var data = decode(items);
					if (val !== null) {
						data[key] = val;
					}
					else {
						delete data[key];
					}
					engine.setItem(namespace, encode(data));
				}, err);
			default:
				return promise.then(function(items) {
					return decode(items);
				}, err);
		}
	};

	this.keys  =  function() {
		return this.data().then(function(data) {
			if (!data) return [];
			var keys = [];
			for (var key in data) {
				keys.push(key);
			}
			return keys;
		});
	};

	this.values  =  function() {
		return this.data().then(function(data) {
			if (!data) return [];
			var values = [];
			for (var key in data) {
				values.push(data[key]);
			}
			return values;
		});
	};

	this.set  =  function(key, data) {
		return this.data(key, data);
	};

	this.get  =  function(key) {
		return this.data(key);
	};

	this.remove  =  function(key) {
		return this.data(key, null);
	}
}

// Register the storage module
angular.module('storyApp.storage')
	.provider('$storageEngine', ['$qProvider', 'EventHandlerProvider', StorageEngineProvider])
	.factory('Storage', StorageProvider);

})(); // End anonymous function
