(function() {
	'use strict';

	/**
	 * This is the controller responsible for talking with the Choosatron!
	**/
	angular.module('storyApp.controllers')
		.controller('ChoosatronCtrl', ChoosatronCtrl)
		.controller('ChoosatronsCtrl', ChoosatronsCtrl);


	ChoosatronCtrl.$inject = ['$location', 'profiles'];

	function ChoosatronCtrl($location, profiles) {
		var vm = this;

		vm.location = $location;

		profiles.load().then(function () {
			//vm.choosatrons = $profiles.current.choosatrons;

			/*var profile = $profiles.current;
			if (!profile) {
				console.error("No profiles selected. Redirecting to ./profiles");
				return $location.path('profiles');
			}

			var choosatrons = profile.choosatrons;
			if (!choosatrons || choosatrons.length == 0) {
				console.error("Profile has no Choosatrons. Redirecting to ./stories");
				return $location.path('stories');
			}*/

		});

		vm.view = function() {
			$location.path('choosatrons');
		}
	}

	ChoosatronsCtrl.$inject = ['$location', 'profiles', 'Choosatron', 'ngDialog'];

	function ChoosatronsCtrl($location, profiles, Choosatron, ngDialog) {
		var vm = this;

		// Variables
		vm.location = $location;
		vm.profiles = profiles;
		vm.state = 'disk';

		// Functions
		vm.releaseClaim = releaseClaim;
		vm.newChoosatron = newChoosatron;
		vm.saveChoosatron = saveChoosatron;
		vm.editChoosatron = editChoosatron;
		vm.verifiedChoosatron = verifiedChoosatron;

		activate();

		function activate() {
			profiles.load().then(function() {
				//vm.choosatrons = $profiles.current.choosatrons;

				/*var test = new Choosatron();
				test.name = "Pickles";
				test.ownerName = $profiles.current.name;
				test.coreId = '53ff6b065067544835331287';
				$profiles.current.choosatrons.push(test);*/

				// Watches are bad: http://www.benlesh.com/2013/10/title.html
				/*$scope.$watchGroup(['vm.choosatrons.current.name', 'vm.choosatrons.current.coreId'],
				                   function(newValues, oldValues, scope) {
					vm.state = 'save';
				});*/
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

			/*console.log("Create new Choosatron profile.");
			var choosatron = new Choosatron();
			choosatron.ownerName = profiles.current.name;
			profiles.current.choosatrons.push(choosatron);*/
			//vm.choosatrons = $profiles.current.choosatrons;
		}

		function saveChoosatron() {
			/*$profiles.current.choosatrons.find(function(perms) {
				return perms.usbDevices;
			});*/
			for (i in profiles.current.choosatrons) {
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

		// Filter for verified devices.
		function verifiedChoosatron(item) {
			return (item.verified);
		}
	}

})();