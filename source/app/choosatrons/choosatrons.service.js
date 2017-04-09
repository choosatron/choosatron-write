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
	this.internal = {};

	this.internal.currentId = null;
	this.internal.serialDevices = {};
	this.editing = null;


	this.save = function() {

	};

	this.load = function() {

	};

	/*this.select = function(aChoosatron) {
		this.current = aChoosatron;
		return this.add(aChoosatron);
	};*/

	this.addSerialDevice = function(aChoosatron) {
		this.internal.serialDevices[aChoosatron.deviceId()] = aChoosatron;
	};

	this.removeSerialDevice = function(aChoosatron) {
		delete this.internal.serialDevices[aChoosatron.deviceId()];
	};

	this.serialDevices = function() {
		return this.internal.serialDevices;
	};

	this.getSerialDevice = function(aDeviceId) {
		return this.internal.serialDevices[aDeviceId];
	};

	this.getSerialKeys = function() {
		return Object.keys(this.internal.serialDevices);
	};

	this.currentId = function(aValue) {
		if (angular.isDefined(aValue)) {
			this.internal.currentId = aValue;
			return;
		}
		return this.internal.currentId;
	};

	this.currentDevice = function(aChoosatron) {
		if (angular.isDefined(aChoosatron)) {
			if (!this.internal.serialDevices.hasOwnProperty(aChoosatron.deviceId())) {
				this.addSerialDevice(aChoosatron);
			}
			this.internal.currentId = aChoosatron.deviceId();
			return;
		}
		return this.serialDevices[this.currentId()];
	};
}]);
