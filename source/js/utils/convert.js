angular.module('storyApp.utils')
.service('Convert', [function() {
	var Convert = {};

	Convert.arrayBufferToString = function(a) {
		return convertArrayBufferToString(a);
	};

	Convert.stringToArrayBuffer = function(str) {
		var buffer = new ArrayBuffer(str.length);
		var view = new Uint8Array(buffer);
		for (var i=0; i<str.length; i++) {
			view[i] = str.charCodeAt(i);
		}
		return buffer;
	};

	return Convert;
}]);
