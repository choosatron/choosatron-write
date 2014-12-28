/**
 *¬This is the controller responsible for talking with the Choosatron!
**/
angular.module('storyApp.controllers')
.controller('ChoosatronCtrl',  ['$scope', '$interval', '$location', '$translators', 'Usb', 'Story',
function ChoosatronCtrl($scope, $interval, $location, $translators, Usb, Story) {
	var usb = new Usb();

	$scope.location = $location;

	//$scope.devices = Usb.deviceList();
	$scope.hasPermission = Usb.permissions;
	$scope.msg = Usb.msg;
	$scope.serialDevices = Usb.serialDevices;
	$scope.dfuDevices = Usb.dfuDevices;

	var intervalPromise;

	$scope.startDeviceScan = function() {
		if (angular.isDefined(intervalPromise)) {
			return;
		}

		intervalPromise = $interval(function() {
			if (Usb.connected()) {
				$scope.stopDeviceScan();
			} else {
				console.log("Update scan!");
				Usb.updateSerialDeviceList();
				Usb.updateDfuDeviceList();
			}
		}, 5000);
	};

	$scope.stopDeviceScan = function() {
		if (angular.isDefined(intervalPromise)) {
			console.log("Stopping device scan...");
			$interval.cancel(intervalPromise)
			intervalPromise = undefined;
		}
	};

	$scope.requestPermissions = function() {
		Usb.requestPermissions();
	};

	$scope.connect = function() {
		console.log("Connect to USB");
		Usb.connect();
		/*.then(function(list) {
			$scope.devices = list;
			$scope.scanned = true;
		});*/
	};

	$scope.$on('$destroy', function() {
		$scope.stopDeviceScan();
	});

	Usb.checkPermissions().then(function(result) {
		console.log("Actual permission: " + result);
		Usb.hasPermissions = result;
		$scope.startDeviceScan();
		Usb.updateSerialDeviceList();
		Usb.updateDfuDeviceList();
	});

}]);
