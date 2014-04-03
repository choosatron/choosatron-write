angular.module('storyApp.filters', [])
.filter('truncate', function () {
	return function (text, length) {
		if (isNaN(length)) {
			length = 100;
		}

		if (text && text.length <= length) {
			return text;

		} else {
			return String(text).slice(0, length);
		}
	};
})
.filter('quote', function () {
	return function (text) {
		if (text && text.match(/Unwritten/)) {
			return text;
		}

		return '"' + text + '"';
	};
});
