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

			vm.cSerial.scanForDevices()
			.then(function (aDeviceId) {
				vm.choosatron = vm.profile.getChoosatron(aDeviceId);
				changeState('connect');
				console.log("scanForDevices: connect");
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

			vm.serial.wifi(vm.creds.ssid, vm.creds.security, vm.creds.password)
			.then(waitToConnect)
			.catch(changeState('connect'));
		}

		function claim() {
			if (!vm.choosatrons.currentId()) {
				vm.state = 'connect';
				vm.errors = ['Could not find a core id for your Choosatron.'];
				return;
			}
			vm.cloud.claim(vm.choosatrons.currentId())
			.then(changeState('claimed'))
			.catch(changeState('unclaimed'));
		}

		function cancel() {
			$scope.closeThisDialog(0);
		}
	}

})();
