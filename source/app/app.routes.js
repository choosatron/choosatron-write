angular.module('storyApp')
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/stories', {templateUrl: 'templates/storiesView.html', controller: 'StoriesCtrl'});
	$routeProvider.when('/choosatron', {templateUrl: 'templates/choosatronsView.html', controller: 'ChoosatronsCtrl', controllerAs: 'vm'});
	$routeProvider.when('/playback', {templateUrl: 'templates/playback/playbackView.html', controller: 'PlaybackCtrl'});
	$routeProvider.when('/story', {templateUrl: 'templates/passages/passageView.html', controller: 'StoryCtrl'});
	$routeProvider.when('/profiles', {templateUrl: 'templates/profilesView.html', controller: 'ProfilesCtrl', controllerAs: 'vm'});
	$routeProvider.otherwise({redirectTo: '/stories'});
}]);