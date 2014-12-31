(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('NewProfileModalCtrl', NewProfileModalCtrl);

	NewProfileModalCtrl.$inject = ['ngDialog', 'Profile'];

	function NewProfileModalCtrl(ngDialog, Profile) {
		var vm = this;

		vm.newProfile = new Profile();
		vm.openSparkDialog = openSparkDialog;

		function openSparkDialog() {
			console.log("Open spark");
			ngDialog.open({
				template: 'templates/sparkAuthModalView.html',
				closeByEscape: false,
				controller: 'SparkAuthModalCtrl'
			});
		}
	}

})();