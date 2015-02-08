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
		vm.location = $location;
		vm.profiles = profiles;
		vm.state = 'disk';
		vm.cloud = null;
		vm.choosatrons = [];

		// Functions
		vm.releaseClaim = releaseClaim;
		vm.newChoosatron = newChoosatron;
		vm.saveChoosatron = saveChoosatron;
		vm.editChoosatron = editChoosatron;

		activate();

		function activate() {
			profiles.load().then(function() {
				vm.profile = profiles.current;
				vm.cloud = new ChoosatronCloud(vm.profile.cloud.token);

				vm.cloud.load().then(function() {
					vm.choosatrons = vm.cloud.choosatrons;
				});
			});
		}

		function releaseClaim() {
			console.log("Release claim on Choosatron.");
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

		function saveChoosatron() {
			for (var i in profiles.current.choosatrons) {
				if (profiles.current.choosatrons[i].id == vm.editing.id) {
					console.log("Matched: " + $profiles.current.choosatrons[i].id);
					profiles.current.choosatrons[i] = vm.editing;
				}
			}
			vm.editing = null;
			profiles.save()
				.then(function() {
				vm.saveState = 'saved';
			});
		}

		function editChoosatron(item) {
			console.log("Edit Choosatron");
			vm.editing = angular.copy(item);
		}
	}

})();
