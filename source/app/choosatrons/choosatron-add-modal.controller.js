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
		vm.errors    = [];
		vm.devices   = [];
		vm.coreId    = '';
		vm.coreIdMsg = '';
		vm.wifiMsg   = '';
		vm.serialMsg = '';

		vm.creds  = {
			ssid: '',
			security: 3,
			password:  ''
		};

		// Functions
		vm.resetState     = resetState;
		vm.cancel         = cancel;
		vm.scanForDevices = scanForDevices;
		vm.connect        = connect;
		vm.sendMsg        = sendMsg;
		vm.startClaim     = startClaim;
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
					vm.state = 'state_add';
				}
				else {
					vm.state = 'plugin';
				}
			});
		}

		function getWifiMsg(msg) {
			vm.wifiMsg += msg;
			console.info(msg);
			return false;
		}

		function connect() {

			serial.mute();
			serial.listen(getWifiMsg, true);

			var sent = ['w', vm.creds.ssid, vm.creds.security, vm.creds.password];

			serial.connect()
			.then(serial.sendMultiple.bind(serial, sent));
		}

		function sendMsg() {
			var msg = vm.serialMsg + "\n";
			serial.send(msg)
			.then(function() {
				vm.wifiMsg = '';
				vm.serialMsg = '';
			});
		}

		function getCoreIdMsg(msg) {
			vm.coreIdMsg += msg;
			if (vm.coreIdMsg.indexOf('\n') >= 0) {
				var parts = vm.coreIdMsg.split(' ');
				vm.coreId = parts[parts.length - 1].trim();
				$scope.$digest();
				return true;
			}
			return false;
		}

		function startClaim() {
			vm.coreIdMsg = '';
			vm.state = 'state_claim';
			serial.connect()
			.then(function() {
				serial.listen(getCoreIdMsg, true);
				serial.send('i');
			});
		}

		function claim() {
			spark.accessToken = vm.profile.cloud.token;
			spark.claimCore(vm.coreId, function(err, data) {
				$scope.$apply(function() {
					if (data.ok) {
						vm.state = 'state_connect';
					}
					else {
						vm.errors = data.errors;
					}
				});
			});
		}

		function resetState() {
			vm.state = 'state_add';
		}

		function cancel() {
			$scope.closeThisDialog(0);
		}
	}

})();
