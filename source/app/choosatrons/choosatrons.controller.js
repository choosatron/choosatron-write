(function() {
	'use strict';

	/**
	 * This is the controller responsible for talking with the Choosatron!
	**/
	angular.module('storyApp.controllers')
		.controller('ChoosatronsCtrl', ChoosatronsCtrl);

	ChoosatronsCtrl.$inject = ['$location', 'profiles', 'ChoosatronSerial', 'ChoosatronCloud', 'ngDialog', 'PRODUCT_IDS'];

	function ChoosatronsCtrl($location, profiles, ChoosatronSerial, ChoosatronCloud, ngDialog, PRODUCT_IDS) {
		var vm = this;

		// Variables
		vm.location     =  $location;
		vm.profiles     =  profiles;
		vm.profile      =  null;
		vm.serial       =  null;
		vm.cloud        =  null;
		vm.productId    =  PRODUCT_IDS.choosatron;

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
			profiles.load().then(function() {
				vm.profile = profiles.current;
				vm.serial = new ChoosatronSerial();
				vm.cloud = new ChoosatronCloud(vm.profile.cloud.token);
				loadChoosatrons();
			});
		}

		// Creates a command function for a choosatron
		function command(choosatron, method) {
			vm.cloud.command(choosatron.id, method)
			.then(function(response) {
				vm.message = {
					type    : 'info',
					content : response.return_value.toString()
				};
			});
		}

		// Call a command on the choostron and wait for a
		// result to be send through an event stream
		function request(choosatron, method) {
			vm.cloud.request(choosatron.id, method)
			.then(function(response) {
				vm.message = {
					type    : 'info',
					content : response
				};
			});
		}

		function inform(msg) {
			return function(data) {
				if (!data.error) {
					vm.message = {
						type: 'success',
						content: msg
					};
				}
				else {
					vm.message = {
						type: 'error',
						content: data.error
					};
				}
			};
		}

		function warn(msg) {
			return function(error) {
				vm.message = {
					type: 'error',
					content: error.message || msg
				};
			};
		}

		function loadChoosatrons() {
			var force = true;
			vm.cloud.load(force).then(function() {
				for (var i = 0; i < vm.cloud.choosatrons.length; i++) {
					vm.profile.saveChoosatron(vm.cloud.choosatrons[i]);
				}
				vm.profiles.save();
			});
		}

		function loadStories(choosatron) {
			vm.cloud.getStoryInfo(choosatron.id)
			.then(function(stories) {
				choosatron.stories = stories;
				choosatron.mode    = 'stories';

				console.log(stories);
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
			vm.cloud.remove(aChoosatron.id).then(loadChoosatrons);
		}

		function rename(aChoosatron) {
			vm.cloud.rename(aChoosatron.id, aChoosatron.newName)
			.then(loadChoosatrons)
			.catch(warn('Could not rename your Choosatron!'));
		}

		function change(aChoosatron) {
			vm.cloud.changeToChoosatron(aChoosatron.id)
			.then(inform('A change request has been sent'))
			.catch(warn('Could not change your device to a Choosatron!'));
		}

		function flash(aChoosatron) {
			vm.cloud.flashAsChoosatron(aChoosatron.id)
			.then(inform('Firmware is updating! Wait until the purple stops flashing.'))
			.catch(warn('Could not update your Choosatron!'));
		}

		function findOverUsb(aChoosatron) {
			console.log("findOverUsb");
		}

		function selectChoosatron(aChoosatron) {
			console.log("selectChoosatron: %s", aChoosatron.id);
			vm.profile.selectChoosatron(aChoosatron.id);
		}

		function newChoosatron() {
			ngDialog.openConfirm({
				template: 'templates/choosatron-add-modal.view.html',
				controller: 'ChoosatronAddModalCtrl',
				data: vm.profiles.current
			}).then(function (device) {
				console.log('Modal promise resolved. Value: ', device);
			}, function (reason) {
				console.log('Modal promise rejected. Reason: ', reason);
			});
		}
	}

})();
