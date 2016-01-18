angular.module('storyApp.models')
.factory('Command', ['BaseModel', 'Operator',
function(BaseModel, Operator) {

	function Command(aData) {
		this.data = {};

		/* Non Serialized */
		this.raw = '';

		/* Serialized */
		this.data.variable = null;
		this.data.verb     = null;
		this.data.value    = null;

		BaseModel.call(this, aData);
	}

	Command.methods = {
		parse: function(aString) {
			this.raw = aString;
			var ptrn = /^(\S+)\s(\S+)\s(.+)$/;
			var parts = ptn.exec(aString);
			if (parts.length < 4) {
				return false;
			}
			this.data.variable = parts[1];
			this.data.verb     = parts[2];
			this.data.value    = parts[3];
			return true;
		},

		isEmpty: function() {
			return !this.variable() || !this.verb() || !this.value();
		},

		cast: function(aValue) {
			var floatVal = parseFloat(aValue);
			if (!isNaN(floatVal)) {
				return floatVal;
			}

			var intVal = parseInt(aValue);
			if (!isNaN(intVal)) {
				return intVal;
			}
			return aValue;
		},

		apply: function(aSource) {
			var func = Operator[this.verb()];
			if (func && func.action) {
				var data = this.cast(aSource[this.variable()] || 0);
				var value = this.cast(this.value());
				aSource[this.variable()] = func.action(data, value);
			}
			return aSource[this.variable()];
		},

		test: function(aSource) {
			var func = Operator[this.verb()];
			if (func && func.action) {
				var data = this.cast(source[this.variable()] || 0);
				var value = this.cast(this.value());
				return func.action(data, value);
			}
			return false;
		},

		/* Getters / Setters */

		getRaw: function() {
			return this.raw;
		},

		getCommandStr: function() {
			return this.variable() + ' ' + this.verb() + ' ' + this.value();
		},

		setCommandStr: function(aValue) {
			this.parse(aValue);
			this.wasModified();
		},

		variable: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.variable = aValue;
				this.wasModified();
				return;
			}
			return this.data.variable;
		},

		/*getVariable: function() {
			return this.data.variable;
		},

		setVariable: function(aValue) {
			this.data.variable = aValue;
			this.wasModified();
		},*/

		verb: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.verb = aValue;
				this.wasModified();
				return;
			}
			return this.data.verb;
		},

		/*getVerb: function() {
			return this.data.verb;
		},

		setVerb: function(aValue) {
			this.data.verb = aValue;
			this.wasModified();
		},*/

		value: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.value = aValue;
				this.wasModified();
				return;
			}
			return this.data.value;
		},

		/*getValue: function() {
			return this.data.value;
		},

		setValue: function(aValue) {
			this.data.value = aValue;
			this.wasModified();
		},*/
	};
	BaseModel.extend(Command, Command.methods);

	return Command;
}
]);
