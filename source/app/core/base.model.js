angular.module('storyApp.models')
.factory('BaseModel', ['Random',
function(Random) {

	/// Model base class ///
	function BaseModel(data) {
		this.id       = Random.id();
		this.created  = Date.now();
		this.modified = null;
		this.opened   = null;

		if (data) this.load(data);
	}

	BaseModel.abbrs = [];

	BaseModel.extend = function(cls, data) {
		cls.prototype = new BaseModel();
		cls.constructor = cls;
		angular.forEach(data, function(func, name) {
			cls.prototype[name] = func;
		});
	};

	BaseModel.prototype = {
		load: function(data) {
			for (var key in data) {
				var proper = key[0].toUpperCase() + key.slice(1);
				var loader = 'load' + proper;
				if (typeof this[loader] === 'function') {
					console.log(key);
					this[loader]( data[key] );
				}
				else {
					this[key] = data[key];
				}
			}
		},

		each: function(field, callback) {
			var list = this[field];
			if (!list) return this;
			for (var i=0; i < list.length; i++) {
				var item = list[i];
				var stop = callback(item);
				if (stop === false) break;
			}
			return this;
		},

		refreshId: function() {
			this.id = Random.id();
		},

		object: function() {
			var o = {};
			for (var key in this) {
				var val = this[key];
				if (val instanceof BaseModel) {
					o[key] = val.serialize();
				}
				else {
					// Will it cause any issues to NOT store null values?
					if ((typeof(val) === 'undefined') ||
					 	(val === null) ||
					    (typeof(val) === 'function') ||
					    (val.length === 0)) {
						continue;
					}
					o[key] = val;
				}
			}
			return o;
		},

		serialize: function(aPretty) {
			var o = this.object();
			//console.log("Final Object:");
			//console.log(o);
			var s = angular.toJson(o, aPretty);
			//console.log(angular.toJson(o, true));
			return s;
		}
	};

	return BaseModel;
}
]);
