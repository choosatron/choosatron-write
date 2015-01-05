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
		} while (tries < len * 10 && this.used.indexOf(value) >= 0)

		return value;
	};

	this.char = function() {
		var i = this.int(0, this.candidates.length - 1);
		var c = this.candidates[i];
		return String.fromCharCode(c);
	};
});
