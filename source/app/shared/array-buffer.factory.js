(function() {

'use strict';

angular.module('storyApp.utils').factory('ArrayBufferFactory', ArrayBufferFactoryProvider);

var factory = {};

factory.fromString = function(str) {
	var buffer = new ArrayBuffer(str.length);
	var view   = new Uint8Array(buffer);
	for (var i=0; i<str.length; i++) {
		view[i] = str.charCodeAt(i);
	}
	return buffer;
};

factory.toString = function(buffer) {
	var arr = new Uint8Array(buffer);
	return String.fromCharCode.apply(null, arr);
};

function ArrayBufferFactoryProvider() {
	return factory;
}

})();
