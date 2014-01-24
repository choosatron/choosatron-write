function StorageEngine($q) {
	if (chrome && chrome.storage) return new ChromeStorageEngine($q);
	if (window.localStorage) return new LocalStorageEngine($q);
	return null;
}

function LocalStorageEngine($q) {
	this.area     =  window.localStorage;
	this.getItem  =  function(key) {
		var deferred = $q.defer();
		var result   = this.area.getItem(key);
		deferred.resolve(result);
		return deferred.promise;
	};

	this.setItem  =  function(key, value) {
		this.area.setItem(key, value);
	};
}

function ChromeStorageEngine($q) {
	this.area     =  chrome.storage.sync;
	this.getItem  =  function(key) {
		var deferred = $q.defer();
		var cb = function(items) {
			deferred.resolve(items);
		};
		this.area.get(key, cb);
		return deferred.promise;
	}

	this.setItem  =  function(key, value) {
		this.area.set(key, value);
	}
}

function Storage(engine, namespace) {
	this.engine = engine;
	this.namespace = namespace;

	this.encode = function(val) {
		return JSON.stringify(val);
	};

	this.decode = function(val) {
		if (!val || val.length == 0) {
			return {};
		}
		try {
			return JSON.parse(val);
		}
		catch (e) {
			if (console) console.error("Error decoding", val);
			return {};
		}
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

function AutoSave($storage) {
	this.limit  =  1000;

	/** 
	 * Watches a particular model within the scope and saves to local storage
	 * whenever the model has changed and the time limit has elapsed 
	 * @todo: Enforce the time limit
	**/
	this.watch = function($scope, modelName, getKey) {
		$scope.$watch(modelName, function(nv, ov, scope) {
			if (!nv && !ov) return;
			var key = getKey ? getKey(nv) : modelName;
			if (!key) return;
			$storage.set(key, nv);
		}, true);
	}
}
