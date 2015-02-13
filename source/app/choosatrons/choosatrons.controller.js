(function() {
	'use strict';

	/**
	 * This is the controller responsible for talking with the Choosatron!
	**/
	angular.module('storyApp.controllers')
		.controller('ChoosatronsCtrl', ChoosatronsCtrl);

	ChoosatronsCtrl.$inject = ['$location', 'profiles', 'ChoosatronCloud', 'ngDialog'];

	function ChoosatronsCtrl($location, profiles, ChoosatronCloud, ngDialog) {
		var vm = this;

		// Variables
		vm.location     =  $location;
		vm.profiles     =  profiles;
		vm.cloud        =  null;
		vm.choosatrons  =  [];

		// Functions
		vm.releaseClaim     =  releaseClaim;
		vm.loadChoosatrons  =  loadChoosatrons;
		vm.newChoosatron    =  newChoosatron;
		vm.saveChoosatron   =  saveChoosatron;

		activate();

		function activate() {
			profiles.load().then(function() {
				vm.profile = profiles.current;
				loadChoosatrons();
			});
		}

		function loadChoosatrons() {
			vm.cloud = new ChoosatronCloud(vm.profile.cloud.token);

			vm.cloud.load().then(function() {
				vm.choosatrons = vm.cloud.choosatrons;
			});
		}

		function releaseClaim(choosatron) {
			choosatron.remove().then(loadChoosatrons);
		}

		function saveChoosatron(choosatron, name) {
			choosatron.rename(name).then(loadChoosatrons);
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
