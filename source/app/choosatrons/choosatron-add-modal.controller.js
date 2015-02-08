(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ChoosatronAddModalCtrl', ChoosatronAddModalCtrl);

	ChoosatronAddModalCtrl.$inject = ['$scope', '$timeout', 'profiles', 'Profile', 'ChoosatronSerial'];

	function ChoosatronAddModalCtrl($scope, $timeout, profiles, Profile, ChoosatronSerial) {
		var vm = this;

		// Variables
		vm.profile   = null;
		vm.state     = '';
		vm.errors    = [];
		vm.ports     = [];
		vm.path      = null;
		vm.serial    = null;

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

		function changeState(state) {
			return function(data) {
				console.info(state, data);
				vm.state = state;
			};
		}

		function scanForDevices() {
			vm.state = 'scanning';

			vm.serial = new ChoosatronSerial(vm.profile.cloud.token);

			vm.serial.connect()
			.then(changeState('connect'))
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
			vm.serial.claim()
			.then(changeState('claimed'))
			.catch(changeState('unclaimed'));
		}

		function cancel() {
			$scope.closeThisDialog(0);
		}
	}

})();
