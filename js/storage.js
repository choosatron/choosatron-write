function StorageEngine($q) {
	if (chrome && chrome.storage) return new ChromeStorageEngine($q);
	if (window.localStorage) return new LocalStorageEngine($q);
	return null;
}

function BaseStorageEngine($q) {
	this.area = {};
	this.listeners = {};

	this.on = function(event, callback) {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		this.listeners[event].push(callback);
		return this;
	};

	this.trigger = function(event) {
		if (!this.listeners[event]) {
			return;
		}
		var self = this;
		var args = Array.prototype.slice.call(arguments, 1);
		this.listeners[event].forEach(function(callback) {
			callback.apply(self, args);
		});
	};

	this.getItem = function(key) {
		var deferred = $q.defer();
		deferred.resolve(this.area[key]);
		return deferred.promise();
	};

	this.setItem = function(key, value) {
		this.area[key] = value;
	};
}

function LocalStorageEngine($q) {
	BaseStorageEngine.apply(this, $q);

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
			this.trigger('set', key, value);
		}
		catch (e) {
			this.trigger('error', e);
		}
	};
}

function ChromeStorageEngine($q) {
	BaseStorageEngine.apply(this, $q);

	this.area     =  chrome.storage.sync;
	this.getItem  =  function(key) {
		var deferred = $q.defer();
		var cb = function(items) {
			deferred.resolve(items[key]);
		};
		this.area.get(key, cb);
		return deferred.promise;
	}

	this.setItem  =  function(key, value) {
		var self = this;
		var obj = {};
		obj[key] = value;
		this.area.set(obj, function() {
			if (!chrome.runtime.lastError) {
				self.trigger('set', key, value);
			}
			else {
				self.trigger('error', chrome.runtime.lastError);
			}
		});
	}
}

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
*    *¬Passes through event handling to the StorageEngine.
	**/
	this.on = function(event, callback) {
		this.engine.on(event, callback);
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
		switch (arguments.length) {
			case 1: 
				var key = arguments[0];
				return promise.then(function(items) {
					var data = decode(items);
					return data[key];
				});
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
				});
			default: 
				return promise.then(function(items) {
					return decode(items);
				});
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
		this.data(key, data);
	};

	this.get  =  function(key) {
		return this.data(key);
	};

	this.remove  =  function(key) {
		this.data(key, null);
	}
}

function AutoSave($storage, $timeout) {

	var listeners = {
		'error': [],
		'saving': [],
		'saved': [],
		'throttling': []
	};

	var fire = function(event) {
		if (!listeners[event]) return;
		var args = Array.prototype.slice.call(arguments, 1);
		var self = this;
		listeners[event].forEach(function(cb) {
			cb.apply(self, args);
		});
	}

	$storage.on('error', function(e) {
		fire('error', e);
	});

	$storage.on('set', function(key, value) {
		fire('saved', key, value);
	});

	this.onSaving = function(callback) {
		listeners.saving.push(callback);
	};

	this.onThrottling = function(callback) {
		listeners.throttling.push(callback);
	}

	this.onSaved = function(callback) {
		listeners.saved.push(callback);
	};

	this.onError = function(callback) {
		listeners.error.push(callback);
	};

	/** 
	 * Watches a particular model within the scope and saves to local storage
	 * whenever the model has changed and the time limit has elapsed 
	 * @todo: Enforce the time limit
	**/
	this.watch = function($scope, modelName, getKey, getValue) {

		// Each change within the throttle time bumps the save action out slightly.
		// Chrome.sync storage has a max sustained save operation of 10 writes/minute
		var throttle = 6000; //ms

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
				fire('saving', key, val);
				$storage.set(key, val);
				lastSave[key] = Date.now();
			};

			var lastTimeSave = lastSave[key];
			if (lastTimeSave && Date.now() - lastTimeSave < throttle) {
				// If we're within the throttle time, bump out the final save call 
				// a little to prevent excessive autosaving.
				fire('throttling', key, throttle);
				savePromise[key] = $timeout(save, throttle);
				return;
			}

			save();
		}, true);
	}
}
