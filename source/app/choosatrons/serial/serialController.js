(function() {
	'use strict';

	/**
	 * This is the controller responsible for talking with the Choosatron!
	**/
	angular.module('storyApp.controllers')
		.controller('SerialCtrl', SerialCtrl);

	SerialCtrl.$inject = ['$scope', '$interval', '$location', 'translators', 'Usb', 'Story'];

	function SerialCtrl($scope, $interval, $location, translators, Usb, Story) {
		var vm = this;

		// Variables
		vm.usb = new Usb();
		vm.location = $location;

		// Functions
		vm.startDeviceScan = startDeviceScan;
		vm.stopDeviceScan = stopDeviceScan;
		vm.requestPermissions = requestPermissions;
		vm.connect = connect;

		function startDeviceScan() {
			if (angular.isDefined(vm.intervalPromise)) {
				return;
			}

			vm.intervalPromise = $interval(function() {
				if (vm.usb.connected()) {
					vm.stopDeviceScan();
				} else {
					console.log("Update scan!");
					vm.usb.updateSerialDeviceList();
					vm.usb.updateDfuDeviceList();
				}
			}, 5000);
		}

		function stopDeviceScan() {
			if (angular.isDefined(vm.intervalPromise)) {
				console.log("Stopping device scan...");
				$interval.cancel(vm.intervalPromise)
				vm.intervalPromise = undefined;
			}
		}

		function requestPermissions() {
			vm.usb.requestPermissions();
		}

		function connect() {
			console.log("Connect to USB");
			vm.usb.connect();
			/*.then(function(list) {
				$scope.devices = list;
				$scope.scanned = true;
			});*/
		}

		$scope.$on('$destroy', function() {
			vm.stopDeviceScan();
		});

		vm.usb.checkPermissions().then(function(result) {
			vm.startDeviceScan();
			vm.usb.updateSerialDeviceList();
			vm.usb.updateDfuDeviceList();
		});

	}

})();