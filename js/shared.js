/**
 * Can be registered as a service that allows communication between controllers¬
**/
function Shared() {
	var data      = {};
	var listeners = {
		'change': [],
		'clear':  []
	};
	return {
		change: function (callback) {
			this.on('change', callback);
		}
		, on: function(event, callback) {
			listeners[event].push(callback);
		}
		, fire: function(event) {
			listeners[event].forEach(function(listener) {
				listener(data);
			});
		}
		, get: function () {
			return data;
		}
		, set: function (value) {
			data = value;
			this.fire('change');
		}
		, clear: function() {
			data = null;
			this.fire('change');
			this.fire('clear');
		}
	}
};
