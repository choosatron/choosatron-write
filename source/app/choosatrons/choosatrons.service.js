angular.module('storyApp.databridge')
.service('Choosatrons', ['Choosatron', '$q',
/**
 * Can be used to manage what is the current choosatron.
 *
 * This service handles passing changes to the selected choosatron
 * between views, and saves the changes to the profile.
**/
function (Choosatron, $q) {

	//this.loaded = false;
	//this.all = {};
	this.currentId = null;
	this.editing = null;
	this.serialDevices = {};

	this.save = function() {

	};

	this.load = function() {

	};

	/*this.select = function(aChoosatron) {
		this.current = aChoosatron;
		return this.add(aChoosatron);
	};*/

	this.addSerialDevice = function(aChoosatron) {
		this.serialDevices[aChoosatron.getDeviceId()] = aChoosatron;
	};

	this.removeSerialDevice = function(aChoosatron) {
		delete this.serialDevices[aChoosatron.getDeviceId()];
	};

	this.getSerialDevices = function() {
		return this.serialDevices;
	};

	this.getSerialDevice = function(aId) {
		return this.serialDevices[aId];
	};

	this.getSerialKeys = function() {
		return Object.keys(this.serialDevices);
	};

	this.setCurrentId = function(aValue) {
		this.currentId = aValue;
	};

	this.getCurrentId = function() {
		return this.currentId;
	};
}]);
