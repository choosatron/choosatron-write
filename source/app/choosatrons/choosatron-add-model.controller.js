(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('ChoosatronAddModalCtrl', ChoosatronAddModalCtrl);

	ChoosatronAddModalCtrl.$inject = ['$scope', 'Profile'];

	function ChoosatronAddModalCtrl($scope, Profile) {
		var vm = this;

		// Variables
		vm.profile = $scope.ngDialogData || new Profile();
		vm.state = '';

		// Functions


		activate();

		function activate() {
			if (vm.profile.cloud.username) {
				vm.state = "state_new_or_add";
			} else {
				vm.state = "state_no_cloud";
			}
		}
	}

})();