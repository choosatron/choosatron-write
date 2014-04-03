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
		, get: function (callback) {
			if (callback) callback(data);
			return data;
		}
		, set: function (value, callback) {
			data = value;
			this.fire('change');
			if (callback) callback(data);
			return data;
		}
		, clear: function(callback) {
			data = null;
			this.fire('change');
			this.fire('clear');
			if (callback) callback(null);
		}
	}
};
