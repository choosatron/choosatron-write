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
			return !this.getVariable() || !this.getVerb() || !this.getValue();
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
			var func = Operator[this.getVerb()];
			if (func && func.action) {
				var data = this.cast(aSource[this.getVariable()] || 0);
				var value = this.cast(this.getValue());
				aSource[this.getVariable()] = func.action(data, value);
			}
			return aSource[this.getVariable()];
		},

		test: function(aSource) {
			var func = Operator[this.getVerb()];
			if (func && func.action) {
				var data = this.cast(source[this.getVariable()] || 0);
				var value = this.cast(this.getValue());
				return func.action(data, value);
			}
			return false;
		},

		/* Getters / Setters */

		getRaw: function() {
			return this.raw;
		},

		getCommandStr: function() {
			return this.getVariable() + ' ' + this.getVerb() + ' ' + this.getValue();
		},

		setCommandStr: function(aValue) {
			this.parse(aValue);
			this.wasModified();
		},

		getVariable: function() {
			return this.data.variable;
		},

		setVariable: function(aValue) {
			this.data.variable = aValue;
			this.wasModified();
		},

		getVerb: function() {
			return this.data.verb;
		},

		setVerb: function(aValue) {
			this.data.verb = aValue;
			this.wasModified();
		},

		getValue: function() {
			return this.data.value;
		},

		setValue: function(aValue) {
			this.data.value = aValue;
			this.wasModified();
		},
	};
	BaseModel.extend(Command, Command.methods);

	return Command;
}
]);
