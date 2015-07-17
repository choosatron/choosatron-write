angular.module('storyApp.models')
.factory('BaseModel', ['Random',
function(Random) {

	/// Model base class ///
	function BaseModel(aData) {
		if (!this.data) {
			this.data = {};
		}
		this.data.id = Random.id();
		this.data.modified = null;

		if (aData) {
			this.load(aData);
		} else {
			this.data.created = Date.now();
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
			//if (typeof aData !== 'object') {
			if (aData.data) {
				//console.log("Not object, use .data");
				aData = aData.data;
			}
			/*jshint -W087 */
			//debugger;

			//console.log("Object: ", aData);

			for (var key in aData) {
				var proper = key[0].toUpperCase() + key.slice(1);
				var loader = 'load' + proper;
				if (typeof this[loader] === 'function') {
					//console.log("Loader: %s, key: %s", aData[key], key);
					this[loader](aData[key]);
				} else {
					if (typeof aData[key] != 'undefined') { // TODO: This ok?
						this.data[key] = aData[key];
					}
				}
			}
			console.log("Class Obj: ", this);
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

		/*object: function() {
			var o = {};
			for (var key in this.data) {
				var val = this.data[key];
				if (val instanceof BaseModel) {
					console.log(val);
					o[key] = val.serialize();
				} else {
					if (typeof val != 'undefined') { // TODO: This ok?
						o[key] = val;
					}
				}
			}
			return o;
		},*/

		object: function() {
			var o = {};
			for (var key in this.data) {
				var val = this.data[key];

				var proper = key[0].toUpperCase() + key.slice(1);
				var objectifier = 'objectify' + proper;
				if (typeof this[objectifier] === 'function') {
					//console.log("Objectifier: %s, key: %s", this.data[key], key);
					o[key] = this[objectifier](this.data[key]);
				} else if (val instanceof BaseModel) {
					console.log(val);
					o[key] = val.serialize();
				} else {
					if (typeof val != 'undefined') { // TODO: This ok?
						o[key] = val;
					}
				}
			}
			return o;
		},

		serialize: function(aPretty) {
			var o = this.object();
			//console.log("story: ", o);
			//console.log("Final Object:");
			//console.log(o);
			//var s = angular.toJson(o, aPretty);
			var s = angular.toJson(o, true);
			//console.log(angular.toJson(o, true));
			return s;
		},

		wasModified: function() {
			this.data.modified = Date.now();
		},

		wasOpened: function() {
			this.data.opened = Date.now();
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
		}

	};

	return BaseModel;
}
]);
