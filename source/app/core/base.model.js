angular.module('storyApp.models')
.factory('BaseModel', ['Random',
function(Random) {

	/// Model base class ///
	function BaseModel(aData) {
		this.data = {};
		this.data.id = Random.id();
		this.data.created = Date.now();
		this.data.modified = null;
		this.data.opened = null;

		if (aData) {
			this.load(aData);
		}
	}

	BaseModel.abbrs = [];

	BaseModel.extend = function(aCls, aData) {
		aCls.prototype = new BaseModel();
		aCls.constructor = aCls;
		angular.forEach(aData, function(func, name) {
			aCls.prototype[name] = func;
		});
	};

	BaseModel.prototype = {
		load: function(aData) {
			if (typeof aData !== 'object') {
				console.log("Not object, use .data");
				aData = aData.data;
			}
			console.log("Object:");
			console.log(aData);

			for (var key in aData) {
				var proper = key[0].toUpperCase() + key.slice(1);
				var loader = 'load' + proper;
				if (typeof this[loader] === 'function') {
					this[loader](aData[key]);
				} else {
					this.data[key] = aData[key];
				}
			}
		},

		each: function(aField, aCallback) {
			var list = this[aField];
			if (!list) {
				return this;
			}
			for (var i = 0; i < list.length; i++) {
				var item = list[i];
				var stop = aCallback(item);
				if (stop === false) break;
			}
			return this;
		},

		object: function() {
			var o = {};
			// TODO: Serialize ONLY this.data
			for (var key in this.data) {
				var val = this.data[key];
				if (val instanceof BaseModel) {
					o[key] = val.serialize();
				} else {
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
			var o = this.data.object();
			//console.log("Final Object:");
			//console.log(o);
			var s = angular.toJson(o, aPretty);
			//console.log(angular.toJson(o, true));
			return s;
		},

		wasModified: function() {
			this.data.modified = Date.now();
		},

		refreshId: function() {
			this.id = Random.id();
		},

		getId: function() {
			return this.data.id;
		},

		getCreated: function() {
			return this.data.created;
		},

		getModified: function() {
			return this.data.modified;
		},

		getOpened: function() {
			return this.data.opened;
		}


	};

	return BaseModel;
}
]);
