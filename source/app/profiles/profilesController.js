angular.module('storyApp.controllers')

.controller('ProfileCtrl', ['$scope', '$location', 'profiles',
function($scope, $location, profiles) {
	profiles.load().then(function() {
		$scope.profiles = profiles;
	});

	$scope.view = function() {
		$location.path('profiles');
	};
}])

.controller('ProfilesCtrl', ['$scope', '$location', 'profiles', 'Profile', 'ngDialog',
function($scope, $location, profiles, Profile, ngDialog) {
	var vm = this;
	vm.location = $location;

	vm.saveState = 'disk';

	profiles.load().then(function() {
		vm.profiles = profiles;
		$scope.$watch('vm.profiles.current.name', function(n, o) {
			vm.saveState = 'save';
		});
	});

	vm.show_stories_menu = function() {
		vm.location.path('stories');
	};

	vm.new_profile = function() {
		//var profile = new Profile();
		//vm.profiles.select(profile);

		//vm.newProfile = new Profile();
		/*ngDialog.open({
			template: 'templates/newProfileView.html',
			controller: 'NewProfileCtrl'
		});*/

		ngDialog.openConfirm({
			template: 'templates/newProfileModalView.html',
			controller: 'NewProfileModalCtrl'
		}).then(function (profile) {
			console.log('Modal promise resolved. Value: ', profile);
			vm.profiles.select(profile);
		}, function (reason) {
			console.log('Modal promise rejected. Reason: ', reason);
		});
	};

	vm.pick_profile = function(profile) {
		vm.profiles.select(profile);
		vm.profiles.save();
	};

	vm.save_profile = function() {
		vm.profiles.save()
		.then(function() {
			vm.saveState = 'saved';
		});
	};

	vm.set_home_path = function() {
		// TODO

	};

}])
