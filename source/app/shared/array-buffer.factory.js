(function() {

'use strict';

angular.module('storyApp.utils').factory('ArrayBufferFactory', ArrayBufferFactoryProvider);

var factory = {};

// A ArrayBuffer builder that grows the size of the array buffer
// as needed
function Builder(buffer) {
	this.frameSize = 512; // The number of bytes to expand when needed.
	this.buffer = buffer || new ArrayBuffer(this.frameSize);
	this.view   = new DataView(this.buffer);
	this.length = 0; // Keeps track of the last offset written
}

// Expands the internal buffer to at least the specified length
// This method will use the frame size to determine the actual length, 
// so that we don't need to continually expand the array for each
// subsequent write.
Builder.prototype.expand = function(length) {
	this.length = length;

	var needed = length - this.buffer.byteLength;
	if (needed <= 0) {
		return;
	}
	var newFrames = Math.ceil(needed / this.frameSize);
	var addLength = newFrames * this.frameSize;
	var oldBuffer = this.buffer;

	this.buffer   = new ArrayBuffer(oldBuffer.byteLength + addLength);
	this.view     = new DataView(this.buffer);

	// Copy the old data
	var dest = new Int8Array(this.buffer);
	dest.set(new Int8Array(oldBuffer));
};

// Trims the internal buffer to the specified length.
Builder.prototype.trim = function(length) {
	length = length || this.length;
	this.buffer = this.buffer.slice(0, length);
	this.view   = new DataView(this.buffer);
	return this.buffer;
};

Builder.prototype.setInt8 = function(offset, value) {
	this.expand(offset + 1);
	this.view.setInt8(offset, value);
};

Builder.prototype.setInt16 = function(offset, value, little) {
	this.expand(offset + 2);
	this.view.setInt16(offset, value, little || false);
};

Builder.prototype.setInt32 = function(offset, value, little) {
	this.expand(offset + 4);
	this.view.setInt32(offset, value, little || false);
};

Builder.prototype.setFloat64 = function(offset, value, little) {
	this.expand(offset + 8);
	this.view.setFloat64(offset, value, little || false);
};

// Assumes 8-bit string values
Builder.prototype.setString = function(offset, str, little) {
	this.expand(offset + str.length);
	for (var i=0; i<str.length; i++) {
		var charCode = str.charCodeAt(i);
		this.view.setInt8(offset + i, charCode, little || false);
	}
};

// Utility Methods
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

factory.Builder = function(buffer) {
	return new Builder(buffer);
};

function ArrayBufferFactoryProvider() {
	return factory;
}

})();
