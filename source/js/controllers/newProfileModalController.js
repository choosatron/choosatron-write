(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('NewProfileModalCtrl', NewProfileModalCtrl);

	NewProfileModalCtrl.$inject = ['ngDialog', 'Profile'];

	function NewProfileModalCtrl(ngDialog, Profile) {
		var vm = this;

		vm.newProfile = new Profile();
		vm.openCloudAuthModal = openCloudAuthModal;

		function openCloudAuthModal() {
			console.log("Open spark");
			ngDialog.openConfirm({
				template: 'templates/cloudAuthModalView.html',
				closeByEscape: false,
				controller: 'CloudAuthModalCtrl',
				data: { profile: vm.newProfile }
			}).then(function (token) {
				console.log('Modal promise resolved.');
				console.log(token);
			}, function (reason) {
				console.log('Modal promise rejected. Reason: ', reason);
			});
		}
	}

})();