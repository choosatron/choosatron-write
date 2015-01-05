/**
 *¬This is the controller responsible for talking with the Choosatron!
**/
angular.module('storyApp.controllers')
.controller('ChoosatronCtrl',  ['$scope', '$interval', '$location', 'translators', 'Usb', 'Story',
function ChoosatronCtrl($scope, $interval, $location, translators, Usb, Story) {
	$scope.usb = new Usb();

	$scope.location = $location;

	//$scope.devices = Usb.deviceList();
	//$scope.hasPermission = Usb.permissions;
	//$scope.msg = Usb.msg;
	//$scope.serialDevices = Usb.serialDevices;
	//$scope.dfuDevices = Usb.dfuDevices;

	var intervalPromise;

	$scope.startDeviceScan = function() {
		if (angular.isDefined(intervalPromise)) {
			return;
		}

		intervalPromise = $interval(function() {
			if ($scope.usb.connected()) {
				$scope.stopDeviceScan();
			} else {
				console.log("Update scan!");
				$scope.usb.updateSerialDeviceList();
				$scope.usb.updateDfuDeviceList();
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
		$scope.usb.requestPermissions();
	};

	$scope.connect = function() {
		console.log("Connect to USB");
		$scope.usb.connect();
		/*.then(function(list) {
			$scope.devices = list;
			$scope.scanned = true;
		});*/
	};

	$scope.$on('$destroy', function() {
		$scope.stopDeviceScan();
	});

	$scope.usb.checkPermissions().then(function(result) {
		$scope.startDeviceScan();
		$scope.usb.updateSerialDeviceList();
		$scope.usb.updateDfuDeviceList();
	});

}]);