angular.module('storyApp.storage')
.factory('Storage', [
function() {
	return function Storage(engine, namespace) {
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
}]);
