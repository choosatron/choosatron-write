(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ChoosatronAddModalCtrl', ChoosatronAddModalCtrl);

	ChoosatronAddModalCtrl.$inject = ['$scope', 'profiles', 'Profile', 'serial'];

	function ChoosatronAddModalCtrl($scope, profiles, Profile, serial) {
		var vm = this;

		// Variables
		vm.profile   = null;
		vm.state     = '';
		vm.devices   = [];
		vm.coreId    = '';
		vm.coreIdMsg = '';
		vm.wifiMsg   = '';
		vm.serialMsg = '';

		// Functions
		vm.resetState     = resetState;
		vm.cancel         = cancel;
		vm.scanForDevices = scanForDevices;
		vm.connect        = connect;
		vm.sendMsg        = sendMsg;
		vm.claim          = claim;

		activate();

		function activate() {
			vm.profile = profiles.current;

			if (vm.profile.cloud.token) {
				scanForDevices();
			} else {
				vm.state = 'state_no_cloud';
			}
		}

		function scanForDevices() {
			vm.state = 'scanning';

			serial.load('usb').then(function() {
				vm.devices = serial.devices;
				if (vm.devices.length) {
					vm.state = 'state_new_or_add';
				}
				else {
					vm.state = 'plugin';
				}
			});
		}

		function getCoreIdMsg(msg) {
			vm.coreIdMsg += msg;
			if (vm.coreIdMsg.indexOf('\n') >= 0) {
				$scope.$digest();
				console.info("Received message", vm.coreIdMsg);
				return true;
			}
			return false;
		}

		function getWifiMsg(msg) {
			vm.wifiMsg += msg;
			$scope.$digest();
			return false;
		}

		function connect() {
			serial.mute();
			serial.listen(getWifiMsg, true);

			serial.connect()
			.then(serial.send.bind(serial, 'w'));
		}

		function sendMsg() {
			var msg = vm.serialMsg + "\n";
			serial.send(msg)
			.then(function() {
				vm.wifiMsg = '';
				vm.serialMsg = '';
			});
		}

		function claim() {
			vm.coreIdMsg = '';
			serial.connect()
			.then(function() {
				serial.listen(getCoreIdMsg, true);
				serial.send('i');
			});
		}

		function resetState() {
			vm.state = 'state_new_or_add';
		}

		function cancel() {
			$scope.closeThisDialog(0);
		}
	}

})();
