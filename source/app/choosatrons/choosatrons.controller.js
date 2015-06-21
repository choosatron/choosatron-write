(function() {
	'use strict';

	/**
	 * This is the controller responsible for talking with the Choosatron!
	**/
	angular.module('storyApp.controllers')
		.controller('ChoosatronsCtrl', ChoosatronsCtrl);

	ChoosatronsCtrl.$inject = ['$location', 'profiles', 'ChoosatronCloud', 'ngDialog', 'PRODUCT_IDS'];

	function ChoosatronsCtrl($location, profiles, ChoosatronCloud, ngDialog, PRODUCT_IDS) {
		var vm = this;

		// Variables
		vm.location     =  $location;
		vm.profiles     =  profiles;
		vm.cloud        =  null;
		vm.choosatrons  =  [];
		vm.productId    =  PRODUCT_IDS.choosatron;

		// Functions
		vm.loadChoosatrons  =  loadChoosatrons;
		vm.newChoosatron    =  newChoosatron;
		vm.rename           =  rename;
		vm.change           =  change;
		vm.flash            =  flash;
		vm.unclaim          =  unclaim;
		vm.command          =  command;
		vm.request          =  request;
		vm.loadStories      =  loadStories;

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

		function loadStories(choosatron) {
			vm.cloud.getStoryInfo(choosatron.id)
			.then(function(stories) {
				choosatron.stories = stories;
				choosatron.mode    = 'stories';
			})
			.catch(function() {
				vm.message = {
					type    : 'error',
					content : 'Sorry, I couldn\'t load your stories'
				};
				choosatron.mode = '';
			});
		}

		function activate() {
			profiles.load().then(function() {
				vm.profile = profiles.current;
				loadChoosatrons();
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
			vm.cloud = new ChoosatronCloud(vm.profile.cloud.token);

			var force = true;
			vm.cloud.load(force).then(function() {
				vm.choosatrons = vm.cloud.choosatrons;
				console.info(vm.choosatrons);
			});
		}

		function unclaim(choosatron) {
			vm.cloud.remove(choosatron.id).then(loadChoosatrons);
		}

		function rename(choosatron) {
			vm.cloud.rename(choosatron.id, choosatron.newName)
			.then(loadChoosatrons)
			.catch(warn('Could not rename your Choosatron!'));
		}

		function change(choosatron) {
			vm.cloud.changetoChoosatron(choosatron.id)
			.then(inform('A change request has been sent'))
			.catch(warn('Could not change your device to a Choosatron!'));
		}

		function flash(choosatron) {
			vm.cloud.flashAsChoosatron(choosatron.id)
			.then(inform('Done!'))
			.catch(warn('Could not update your Choosatron!'));
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
