angular.module('storyApp.storage')
.factory('Storage', ['EventHandler',
function(EventHandler) {
	return function Storage(engine, namespace) {
		this.engine = engine;
		this.namespace = namespace;
		this.events = EventHandler.create('set', 'get', 'delete', 'error');

		this.on = function(events, callback) {
			this.events.on(events, callback);
		};

		/**
		 * Operates much like the jQuery.data method.
		 * With no arguments, returns a promise that will resolve with all of the items in the namespace
		 * With 1 argument, returns a promise that will resolve with value stored in that key
		 * With 2 arguments, sets the key on the list to the specified value;
		**/
		this.data  =  function() {
			if (!this.engine) return null;
			var ns    = this.namespace;
			var self  = this;
			var err   = function(e) {
				self.events.fire('error', e);
			}

			switch (arguments.length) {
				case 1:
					var key = arguments[0];
					var got = function(item) {
						self.events.fire('get', item);
						return item;
					};
					return this.engine.getItem(ns, key).then(got, err);
				case 2:
					var key = arguments[0];
					var val = arguments[1];
					var saved = function() {
						self.events.fire('set', ns, key, val);
					}
					if (val !== null) {
						return this.engine.setItem(ns, key, val)
						.then(saved, err);
					}
					else {
						return this.engine.deleteItem(ns, key)
						.then(saved, err);
					}
				default:
					var got = function(item) {
						self.events.fire('get', item);
						return item;
					};
					return this.engine.getItem(ns).then(got, err);
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

		this.set = function(key, data) {
			return this.data(key, data);
		};

		this.get = function(key) {
			return this.data(key);
		};

		this.remove = function(key) {
			return this.data(key, null);
		}
	}
}]);
