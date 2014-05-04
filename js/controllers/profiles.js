angular.module('storyApp.controllers')

.controller('ProfileCtrl', ['$scope', '$location', '$selection',
function($scope, $location, $selection) {
	$selection.getProfiles()
	.then(function(profiles) {
		profiles = profiles || {};
		$scope.profiles = profiles;
		$scope.profile = profiles[profiles.activeId];
	});

	$scope.view = function() {
		$location.path('profiles');
	};
}])

.controller('ProfilesCtrl', ['$scope', '$location', '$selection',
function($scope, $location, $selection) {

	$scope.show_stories_menu = function() {
		$location.path('stories');
	};

}])
