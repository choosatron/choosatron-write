angular.module('storyApp.models')
.service('Operator', function() {
	return {
		'==': {
			name: 'equals',
			type: 'condition',
			action: function(a, b) {
				return a == b;
			}
		},
		'!=': {
			name: 'not equals',
			type: 'condition',
			action: function(a, b) {
				return a != b;
			}
		},
		'>': {
			name: 'greater than',
			type: 'condition',
			action: function(a, b) {
				return a > b;
			}
		},
		'>=': {
			name: 'greater than or equal to',
			type: 'condition',
			action: function(a, b) {
				return a >= b;
			}
		},
		'<': {
			name: 'less than',
			type: 'condition',
			action: function(a, b) {
				return a < b;
			}
		},
		'<=': {
			name: 'less than or equal to',
			type: 'condition',
			action: function(a, b) {
				return a <= b;
			}
		},
		'=': {
			name: 'set to',
			type: 'update',
			action: function(a, b) {
				return b;
			}
		},
		'+=': {
			name: 'increase by',
			type: 'update',
			action: function(a, b) {
				return a + b;
			}
		},
		'-=': {
			name: 'subtract by',
			type: 'update',
			action: function(a, b) {
				return a - b;
			}
		},
		'*=': {
			name: 'multiply by',
			type: 'update',
			action: function(a, b) {
				return a * b;
			}
		},
		'/=': {
			name: 'divide by',
			type: 'update',
			action: function(a, b) {
				return a / b;
			}
		}
	};
})
.service('Operators', ['Operator', function(Operator) {

	var Operators = [];

	Operator.keywords = Object.keys(Operator);
	Operator.keywords.forEach(function(key) {
		var op = Operator[key];
		op.keyword = key;
		Operators.push(op);
	});

	Object.defineProperty(Operators, 'conditions', {
		get: function() {
			return this.filter(function(o) {return o.type == 'condition';});
		}
	});

	Object.defineProperty(Operators, 'updates', {
		get: function() {
			return this.filter(function(o) {return o.type == 'update';});
		}
	});

	return Operators;
}
]);
