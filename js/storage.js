function StorageEngine() {
	if (chrome && chrome.storage) return chrome.storage;
	if (window.localStorage) return window.localStorage;
	return new MemoryStorage();
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
	 * With no arguments, returns all of the data stored in the specified namespace.
	 * With 1 argument, returns the value stored in that key
	**/
	this.data  =  function() {
		if (!this.engine) return null;
		var data = this.decode(this.engine.getItem(this.namespace));
		switch (arguments.length) {
			case 1: 
				return data[arguments[0]];
			case 2: 
				var key = arguments[0];
				var val = arguments[1];
				if (!key) {
					if (console) console.error("Attempt to save with undefined key", key);
					return;
				}
				if (val !== null) {
					data[key] = val;
				}
				else {
					delete data[key];
				}
				this.engine.setItem(this.namespace, this.encode(data));
				return; 
			default: 
				return data;
		}
	};

	this.keys  =  function() {
		var data = this.data();
		if (!data) return [];
		var keys = [];
		for (var key in data) {
			keys.push(key);
		}
		return keys;
	};

	this.values  =  function() {
		var data = this.data();
		if (!data) return [];
		var values = [];
		for (var key in data) {
			values.push(data[key]);
		}
		return values;
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

	this.length  =  function() {
		return this.keys().length;
	}
}

function MemoryStorage() {
	this.data    =  {};
	this.length  =  0;

	this.key  =  function(index) {
		return null;
	}

	this.setItem  =  function(key, value) {
		this.data[key] = value;
		this.length    = this.data.length;
	};

	this.getItem  =  function(key) {
		return this.data[key];
	};

	this.removeItem  =  function(key) {
		delete this.data[key];
		this.length = this.data.length;
	};
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
			var key = getKey ? getKey(nv) : modelName;
			if (key === null) return;
			$storage.set(key, nv);
		}, true);
	}
}
