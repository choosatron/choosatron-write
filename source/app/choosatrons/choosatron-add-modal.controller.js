(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ChoosatronAddModalCtrl', ChoosatronAddModalCtrl);

	ChoosatronAddModalCtrl.$inject = ['$scope', 'profiles', 'Profile'];

	function ChoosatronAddModalCtrl($scope, profiles, Profile) {
		var vm = this;

		// Variables
		vm.profile = null;
		vm.state   = '';

		// Functions
		vm.resetState = resetState;
		vm.cancel     = cancel;


		activate();

		function activate() {
			vm.profile = profiles.current;

			if (vm.profile.cloud.token) {
				vm.state = 'state_new_or_add';
			} else {
				vm.state = 'state_no_cloud';
			}
		}

		function resetState() {
			vm.state = 'state_new_or_add';
		}

		function cancel() {
			$scope.closeThisDialog(0);
		}
	}

})();
