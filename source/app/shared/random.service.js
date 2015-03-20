angular.module('storyApp.utils')
.service('Random', function() {

	this.defaultLen = 10;
	this.used = [];
	this.candidates = [];

	for (var i=97; i<=122; i++) {
		this.candidates.push(i);
	}

	this.float = function(min, max) {
		return Math.random() * (max - min) + max;
	};

	this.int = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	};

	this.uuid = function() {
		var digits = '0123456789abdef';
		var char = this.char.bind(this);
		function part(len) {
			var a = new Array(len);
			for (var i=0; i<len; i++) {
				a[i] = char(digits);
			}
			return a;
		}
		return [part(8), part(4), part(4), part(4), part(12)].join('-');
	};

	this.id = function(len) {
		len = len || this.defaultLen;
		var self = this;
		var build = function() {
			var value = '';
			for (var i=0; i<len; i++) {
				value += self.char();
			}
			return value;
		};

		var tries = 0;
		var value = '';

		do {
			value = build();
			tries++;
		} while (tries < len * 10 && this.used.indexOf(value) >= 0);

		return value;
	};

	this.char = function(candidates) {
		candidates = candidates || this.candidates;
		var i = this.int(0, candidates.length - 1);
		var c = candidates[i];
		return String.fromCharCode(c);
	};
});
