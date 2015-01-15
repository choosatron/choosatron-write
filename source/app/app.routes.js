angular.module('storyApp')
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/stories', {templateUrl: 'templates/stories.view.html', controller: 'StoriesCtrl', controllerAs: 'vm'});
	$routeProvider.when('/choosatron', {templateUrl: 'templates/choosatrons.view.html', controller: 'ChoosatronsCtrl', controllerAs: 'vm'});
	$routeProvider.when('/playback', {templateUrl: 'templates/playback.view.html', controller: 'PlaybackCtrl', controllerAs: 'vm'});
	$routeProvider.when('/story', {templateUrl: 'templates/passage.view.html', controller: 'StoryCtrl', controllerAs: 'vm'});
	$routeProvider.when('/profiles', {templateUrl: 'templates/profiles.view.html', controller: 'ProfilesCtrl', controllerAs: 'vm'});
	$routeProvider.otherwise({redirectTo: '/profiles'});
}]);