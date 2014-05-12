angular.module('storyApp.controllers')

.controller('ProfileCtrl', ['$scope', '$location', '$profiles',
function($scope, $location, $profiles) {
	$profiles.load().then(function() {
		$scope.profiles = $profiles;
	});

	$scope.view = function() {
		$location.path('profiles');
	};
}])

.controller('ProfilesCtrl', ['$scope', '$location', '$profiles', 'Profile',
function($scope, $location, $profiles, Profile) {

	$scope.saveState = 'disk';

	$profiles.load().then(function() {
		$scope.profiles = $profiles;
		$scope.$watch('profiles.current.name', function(n, o) {
			$scope.saveState = 'save';
		});
	});

	$scope.show_stories_menu = function() {
		$location.path('stories');
	};

	$scope.new_profile = function() {
		var profile = new Profile();
		$profiles.select(profile);
	};

	$scope.pick_profile = function(profile) {
		$profiles.select(profile);
		$profiles.save();
	};

	$scope.save_profile = function() {
		$profiles.save()
		.then(function() {
			$scope.saveState = 'saved';
		});
	};

}])
