(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ChoosatronAddModalCtrl', ChoosatronAddModalCtrl);

	ChoosatronAddModalCtrl.$inject = ['$scope', '$timeout', 'Choosatrons', 'Profiles', 'Profile', 'ChoosatronSerial', 'ChoosatronCloud'];

	function ChoosatronAddModalCtrl($scope, $timeout, Choosatrons, Profiles, Profile, ChoosatronSerial, ChoosatronCloud) {
		var vm = this;

		// Variables
		vm.profile    = null;
		vm.choosatron = null;
		vm.state      = '';
		vm.errors     = [];
		vm.ports      = [];
		vm.path       = null;
		vm.serial     = null;
		vm.cloud      = null;
		vm.choosatrons = Choosatrons;

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
			vm.profile = Profiles.current;

			if (vm.profile.auth()) {
				vm.state = 'plugin';
			} else {
				vm.state = 'no_cloud';
			}
		}

		function changeState(state) {
			return function(data) {
				console.info(state, arguments);
				vm.state = state;
				vm.errors = data && data.errors;
			};
		}

		function scanForDevices() {
			vm.state = 'scanning';

			vm.cSerial = new ChoosatronSerial();
			vm.cloud  = new ChoosatronCloud(vm.profile.auth().token());

			vm.cSerial.connect()
			.then(function(aDeviceId) {
				console.log("State change: " + aDeviceId);
				// Potentially only exists as a serial device.
				// Must determine if it even has Choosatron firmware, if not then set it up.
				// Or if it IS a Choosatron, do we already have it in our list?
				// If not, then add a new Choosatron.
				var newDevice = vm.choosatrons.getSerialDevice(aDeviceId);
				var choosatron = vm.profile.getChoosatron(aDeviceId);
				if (newDevice.productId() === null) {
					if (choosatron !== null) {
						console.log("Already have Choosatron, but for some reason it is in listening mode.");
						vm.cancel();
						return;
					}
					console.log("New device!");
					vm.claim();
				} else if (choosatron === null) {
					console.log("New Choosatron!");
					vm.choosatrons.currentDevice(newDevice);
					vm.profile.saveChoosatron(newDevice);
					vm.choosatron = newDevice;
					vm.state = 'connect';
					console.log(vm.profile.choosatrons());
				} else {
					// We already have this Choosatron.
					choosatron.isWired(true);
					choosatron.lastWired(newDevice.lastWired());
					choosatron.serialPath(newDevice.serialPath());
					console.log("Already have device: " + newDevice);
					vm.cancel();
				}
			})
			.catch(changeState('plugin'));
		}

		function canConnect() {
			return vm.creds.ssid.length && (vm.creds.security === 0 || vm.creds.password.length);
		}

		function connect() {
			vm.state = 'connecting';

			function waitToConnect() {
				$timeout(changeState('connected'), 10000);
			}

			vm.cSerial.wifi(vm.creds.ssid, vm.creds.security, vm.creds.password)
			.then(waitToConnect)
			.catch(changeState('connect'));
		}

		function claim() {
			if (!vm.choosatrons.currentId()) {
				vm.state = 'connect';
				vm.errors = ['Could not find a device id for your Choosatron.'];
				return;
			}
			console.log("CLAIM");
			vm.cloud.claim(vm.choosatrons.currentId())
			.then(changeState('claimed'))
			.catch(changeState('unclaimed'));
		}

		function cancel() {
			$scope.closeThisDialog(0);
		}
	}

})();
