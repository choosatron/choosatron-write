angular.module('storyApp.utils')
.service('EventHandler', ['$timeout', '$rootScope', function($timeout, $rootScope) {
	function EventHandler() {
		this.listeners = {};
		this.async = false;
		this.context = null;

		this.register = function(names) {
			for (var i=0; i<names.length; i++) {
				this.listeners[names[i]] = [];
			}
		};

		this.on = function(events, callback) {
			var events = events.split(' ');
			var self = this;
			events.forEach(function(event) {
				self.listeners[event].push(callback);
			});
		};

		this.fire = function(event) {
			if (!this.listeners[event]) {
				console.warn("Received unregistered event", event, ctx);
				return;
			}
			var ctx = this.context || this;
			var args = Array.prototype.splice.call(arguments, 1);
			var async = this.async;
			var call = function(callback) {
				if (async) {
					$timeout(function() {
						$rootScope.$apply(function() {
							callback.apply(ctx, args);
						});
					});
				}
				else {
					callback.apply(ctx, args);
				}
			};
			this.listeners[event].forEach(call);
		};
	};

	this.create = function() {
		var eh = new EventHandler();
		if (arguments.length) {
			eh.register(arguments);
		}
		return eh;
	};
}]);
