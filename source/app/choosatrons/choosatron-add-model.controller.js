(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ChoosatronAddModalCtrl', ChoosatronAddModalCtrl);

	ChoosatronAddModalCtrl.$inject = ['$scope', 'Profile'];

	function ChoosatronAddModalCtrl($scope, Profile) {
		var vm = this;

		// Variables
		vm.profile = null;
		vm.state = '';

		// Functions


		activate();

		function activate() {
			vm.profile = profiles.current;

			if (vm.profile.cloud.token) {
				vm.state = "state_new_or_add";
			} else {
				vm.state = "state_no_cloud";
			}
		}
	}

})();