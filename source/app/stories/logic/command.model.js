angular.module('storyApp.models')
.factory('Command', ['BaseModel', 'Operator',
function(BaseModel, Operator) {

	function Command(data) {
		this.variable = null;
		this.verb     = null;
		this.value    = null;

		Object.defineProperty(this, 'raw', {
			get: function() {
				return this.variable + ' ' + this.verb + ' ' + this.value;
			},
			set: function(str) {
				this.parse(str);
			},
		});

		BaseModel.call(this, data);
	}

	Command.methods = {
		parse: function(str) {
			this.raw = str;
			var ptrn = /^(\S+)\s(\S+)\s(.+)$/;
			var parts = ptn.exec(str);
			if (parts.length < 4) {
				return false;
			}
			this.variable = parts[1];
			this.verb     = parts[2];
			this.value    = parts[3];
			return true;
		},

		empty: function() {
			return !this.variable || !this.verb || !this.value;
		},

		cast: function(v) {
			var f = parseFloat(v);
			if (!isNaN(f)) return f;
			var i = parseInt(v);
			if (!isNaN(i)) return i;
			return v;
		},

		apply: function(source) {
			var func = Operator[this.verb];
			if (func && func.action) {
				var data = this.cast(source[this.variable] || 0);
				var value = this.cast(this.value);
				source[this.variable] = func.action(data, value);
			}
			return source[this.variable];
		},

		test: function(source) {
			var func = Operator[this.verb];
			if (func && func.action) {
				var data = this.cast(source[this.variable] || 0);
				var value = this.cast(this.value);
				return func.action(data, value);
			}
			return false;
		}
	};
	BaseModel.extend(Command, Command.methods);

	return Command;
}
]);
