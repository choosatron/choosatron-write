angular.module('storyApp.controllers')

.controller('ProfileCtrl', ['$scope', '$location', '$selection',
function($scope, $location, $selection) {
	$selection.getActiveProfile()
	.then(function(profile) {
		$scope.profile = profile;
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
