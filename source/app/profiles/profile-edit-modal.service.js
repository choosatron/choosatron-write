(function() {
	'use strict';

	// This service wraps some of the common profile UI interactions
	angular.module('storyApp.controllers')
		.service('ProfileEditModalService', ProfileEditModalService);

	ProfileEditModalService.$inject = ['$q', 'profiles', 'Profile', 'ngDialog'];

	function ProfileEditModalService($q, profiles, Profile, ngDialog) {
		this.q        = $q;
		this.profiles = profiles;
		this.dialog   = ngDialog;
		this.Profile  = Profile;
	}

	// Open the profile edit modal
	ProfileEditModalService.prototype.open = function() {
		var dialog = this.dialog;
		return dialog.openConfirm({
			template: 'templates/profile-edit-modal.view.html',
			showClose: false,
			closeByEscape: false,
			preCloseCallback: function(value) {
				var nestedConfirmDialog = dialog.openConfirm({
					template: 'templates/modal-close-confirm.view.html',
					showClose: false,
					closeByEscape: false,
					plain: false
				});

				// NOTE: return the promise from openConfirm
				return nestedConfirmDialog;
			}
		});
	};

	// Returns a promise created by the modal dialog. On success, the
	// promise returns the profile that has been edited.
	ProfileEditModalService.prototype.edit = function(aProfile) {
		var deferred = this.q.defer();
		var dialog   = this.dialog;
		var profiles = this.profiles;

		var openModal = this.open()
		.then(function (profile) {
			profiles.select(profile);
			deferred.resolve(profile);
		}, deferred.reject);

		this.profiles.select(aProfile).then(openModal);

		return deferred.promise;
	};

	// Create a new profile
	ProfileEditModalService.prototype.create = function() {
		var aProfile = new this.Profile();
		return this.edit(aProfile);
	};

})();
