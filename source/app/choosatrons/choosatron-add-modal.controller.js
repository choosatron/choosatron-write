(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ChoosatronAddModalCtrl', ChoosatronAddModalCtrl);

	ChoosatronAddModalCtrl.$inject = ['$scope', 'profiles', 'Profile', 'serial', 'Devices'];

	function ChoosatronAddModalCtrl($scope, profiles, Profile, serial, Devices) {
		var vm = this;

		// Variables
		vm.profile   = null;
		vm.state     = '';
		vm.errors    = [];
		vm.ports     = [];
		vm.path      = null;
		vm.devices   = null;
		vm.device    = {
			coreId : null,
			name   : '',
		};

		vm.creds  = {
			ssid     : '',
			security : 3,
			password : ''
		};

		// Functions
		vm.cancel         = cancel;
		vm.scanForDevices = scanForDevices;
		vm.canConnect     = canConnect;
		vm.connect        = connect;
		vm.claim          = claim;

		activate();

		function activate() {
			vm.profile = profiles.current;

			if (vm.profile.cloud.token) {
				vm.state = 'plugin';
			} else {
				vm.state = 'no_cloud';
			}
		}

		function scanForDevices() {
			vm.state = 'scanning';

			vm.devices = new Devices(vm.profile.cloud.token);

			// Load up the current profile's claimed devices
			vm.devices.load().then(function() {
				// Then scan USB for connected Choosatrons
				serial.load('usb').then(function() {
					vm.ports = serial.ports;
					if (vm.ports.length) {
						findCore();
					}
					else {
						vm.state = 'plugin';
					}
				});
			});
		}

		// Loop through the USB devices and look for the one
		// that responds after issuing a request for core id.
		// If we find a valid core, try to claim it. Otherwise,
		// prompt the user!
		function findCore() {
			serial.broadcast('i')
			.then(function(result) {
				for (var path in result) {
					console.info('Got', result[path], 'from', path);
					var coreId = foundCore(path, result[path]);
					if (coreId) {
						startConnect(path, coreId);
						return;
					}
				}
				vm.state = 'plugin';
			});
		}

		function foundCore(path, response) {
			if (!response || !response.length) {
				return false;
			}

			var pattern = /\s([0-9a-f]{24})\s/;
			var match = pattern.exec(response);

			if (!match) {
				return false;
			}

			return match[1];
		}

		function startConnect(path, coreId) {
			if (!path || !coreId) {
				vm.state = 'plugin';
				return;
			}
			vm.path = path;

			vm.device.coreId = coreId;
			vm.device.name   = '';

			vm.state = 'connect';
		}

		function canConnect() {
			return vm.creds.ssid.length && (vm.creds.security === 0 || vm.creds.password.length);
		}

		function connect() {
			vm.state = 'connecting';
			var sent = ['w', vm.creds.ssid, vm.creds.security, vm.creds.password];
			serial.connect(vm.path)
			.then(function() {
				serial.sendMultiple(sent);
			});
		}

		function claim() {
			var existing = vm.devices.find(vm.device.coreId);

			if (existing) {
				if (existing.name !== vm.device.name) {
					existing.rename(vm.device.name);
				}
				vm.state = 'claimed';
				return;
			}

			vm.devices.claim(vm.device.coreId)
			.then(function(data) {
				$scope.$apply(function() {
					if (data.ok) {
						vm.state = 'claimed';
					}
					else {
						vm.state = 'unclaimed';
						vm.errors = data.errors;
					}
				});
			});
		}

		function cancel() {
			$scope.closeThisDialog(0);
		}
	}

})();
