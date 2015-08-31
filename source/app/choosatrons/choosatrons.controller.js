(function() {
	'use strict';

	/**
	 * This is the controller responsible for talking with the Choosatron!
	**/
	angular.module('storyApp.controllers')
		.controller('ChoosatronsCtrl', ChoosatronsCtrl);

	ChoosatronsCtrl.$inject = ['$location', 'Profiles', 'Choosatrons', 'ChoosatronSerial', 'ChoosatronCloud', 'ngDialog', 'PRODUCT_IDS'];

	function ChoosatronsCtrl($location, Profiles, Choosatrons, ChoosatronSerial, ChoosatronCloud, ngDialog, PRODUCT_IDS) {
		var vm = this;

		// Variables
		vm.location     =  $location;
		vm.profiles     =  Profiles;
		vm.profile      =  null;
		vm.serial       =  null;
		vm.cloud        =  null;
		vm.productId    =  PRODUCT_IDS.choosatron;
		// The core ID of the choosatron connected over serial.
		vm.currentId    = null;

		// Functions
		vm.command          =  command;
		vm.request          =  request;
		vm.inform           =  inform;
		vm.warn             =  warn;
		vm.loadStories      =  loadStories;
		vm.unclaim          =  unclaim;
		vm.rename           =  rename;
		vm.change           =  change;
		vm.flash            =  flash;
		vm.findOverUsb      =  findOverUsb;
		vm.selectChoosatron =  selectChoosatron;
		vm.newChoosatron    =  newChoosatron;

		// Commands that return a value
		vm.commands  =  {
			'get_current_story'  : 'Get Current Story Info',
			'get_storage_report' : 'Get Storage Report'
		};

		// Commands that require a subscription to read
		vm.requests = {
			'get_local_ip'       : 'Get IP Address',
			'get_mac_addr'       : 'Get MAC Address'
		};

		activate();

		function activate() {
			Profiles.load().then(function() {
				vm.profile = Profiles.current;
				console.log(vm.profile.getChoosatrons());
				vm.serial = new ChoosatronSerial();
				vm.cloud = new ChoosatronCloud(vm.profile.getCloudAuth().getToken());
				loadChoosatrons();
			});
		}

		// Creates a command function for a choosatron
		function command(aChoosatron, aMethod) {
			vm.cloud.command(aChoosatron.getDeviceId(), aMethod)
			.then(function(response) {
				vm.message = {
					type    : 'info',
					content : response.return_value.toString()
				};
			});
		}

		// Call a command on the choostron and wait for a
		// result to be send through an event stream
		function request(aChoosatron, aMethod) {
			vm.cloud.request(aChoosatron.getDeviceId(), aMethod)
			.then(function(response) {
				vm.message = {
					type    : 'info',
					content : response
				};
			});
		}

		function inform(aMsg) {
			return function(aData) {
				if (!aData.error) {
					vm.message = {
						type: 'success',
						content: aMsg
					};
				}
				else {
					vm.message = {
						type: 'error',
						content: aData.error
					};
				}
			};
		}

		function warn(aMsg) {
			return function(aError) {
				vm.message = {
					type: 'error',
					content: aError.message || aMsg
				};
			};
		}

		function loadChoosatrons() {
			var force = true;
			vm.cloud.load(force).then(function() {
				for (var i = 0; i < vm.cloud.choosatrons.length; i++) {
					var choosatron = new Choosatron(vm.cloud.choosatrons[i]);
					vm.profile.saveChoosatron(choosatron);
				}
				vm.profiles.save();
			});
		}

		function loadStories(aChoosatron) {
			vm.cloud.getStoryInfo(aChoosatron.getDeviceId())
			.then(function(aStories) {
				choosatron.stories = aStories;
				choosatron.mode    = 'stories';

				console.log(aStories);
			})
			.catch(function() {
				vm.message = {
					type    : 'error',
					content : 'Sorry, I couldn\'t load your stories'
				};
				choosatron.mode = '';
			});
		}

		function unclaim(aChoosatron) {
			vm.cloud.remove(aChoosatron.getDeviceId()).then(loadChoosatrons);
		}

		function rename(aChoosatron) {
			vm.cloud.rename(aChoosatron.getDeviceId(), aChoosatron.newName)
			.then(loadChoosatrons)
			.catch(warn('Could not rename your Choosatron!'));
		}

		function change(aChoosatron) {
			vm.cloud.changeToChoosatron(aChoosatron.getDeviceId())
			.then(inform('A change request has been sent'))
			.catch(warn('Could not change your device to a Choosatron!'));
		}

		function flash(aChoosatron) {
			vm.cloud.flashAsChoosatron(aChoosatron.getDeviceId())
			.then(inform('Firmware is updating! Wait until the purple stops flashing.'))
			.catch(warn('Could not update your Choosatron!'));
		}

		function findOverUsb(aChoosatron) {
			console.log("findOverUsb");
			vm.serial.scanForChoosatrons().then(function() {
				console.log("Found devices:");
				console.log(Choosatrons.getSerialDevices());
				//vm.serial.destroy();

				/*vm.serial.connectToId(Object.keys(vm.serial.devicesAvailable)[0]).then(function() {
					console.log("Connected to device: %s", Object.keys(vm.serial.devicesAvailable)[0]);
				});*/
			});
		}

		function selectChoosatron(aChoosatron) {
			console.log("selectChoosatron: %s", aChoosatron.getDeviceId());
			//vm.profile.selectChoosatron(aChoosatron.getDeviceId());

			/*vm.serial.connect().then(function() {
				console.log("Connected to:");
				console.log(vm.serial.coreId);
				//vm.serial.destroy();
			});*/
			vm.serial.connectToId(Choosatrons.getSerialKeys()[0]).then(function() {
				console.log("Connected to device: %s", Choosatrons.getSerialKeys()[0]);
			}).catch(function() {
				console.log("Failed in the controller!");
			});
		}

		function newChoosatron() {
			ngDialog.openConfirm({
				template: 'templates/choosatron-add-modal.view.html',
				controller: 'ChoosatronAddModalCtrl',
				data: vm.profile
			}).then(function (device) {
				console.log('Modal promise resolved. Value: ', device);
			}, function (reason) {
				console.log('Modal promise rejected. Reason: ', reason);
			});
		}
	}

})();
