angular.module('storyApp.controllers')

.controller('ProfileCtrl', ['$scope', '$location', '$profiles',
function($scope, $location, $profiles) {
	$profiles.load().then(function() {
		$scope.profile = $profiles.current;
	});

	$scope.view = function() {
		$location.path('profiles');
	};
}])

.controller('ProfilesCtrl', ['$scope', '$location', '$profiles', 'Profile',
function($scope, $location, $profiles, Profile) {

	$profiles.load().then(function() {
		$scope.profile = $profiles.current;
		$scope.profiles = $profiles.all;
	});

	$scope.show_stories_menu = function() {
		$location.path('stories');
	};

	$scope.new_profile = function() {
		var profile = new Profile();
		$scope.profile = profile;
		$profiles.select(profile);
	};

	$scope.pick_profile = function(profile) {
		$profiles.select(profile);
	};

	$scope.save_profile = function() {
		$scope.saving = true;
		$profiles.save()
		.then(function() {
			$scope.saving = false;
		});
	};

}])
