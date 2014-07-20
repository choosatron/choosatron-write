angular.module('storyApp.utils')
.factory('Shared', ['EventHandler', function(EventHandler) {
	return function Shared() {
		var events = EventHandler.create('get', 'set');
		events.context = this;

		this.data = {};

		this.on = function(event, callback) {
			events.on(event, callback);
		};

		this.get = function (callback) {
			if (callback) callback(this.data);
			events.fire('get', this.data);
			return this.data;
		};

		this.set = function (value, callback) {
			this.data = value;
			events.fire('set', this.data);
			if (callback) callback(this.data);
			return this.data;
		};

		this.clear = function(callback) {
			this.data = null;
			events.fire('set', null);
			if (callback) callback(null);
		};
	};
}]);
