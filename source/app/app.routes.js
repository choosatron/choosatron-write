angular.module('storyApp')
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/stories', {templateUrl: 'templates/storiesView.html', controller: 'StoriesCtrl', controllerAs: 'vm'});
	$routeProvider.when('/choosatron', {templateUrl: 'templates/choosatronsView.html', controller: 'ChoosatronsCtrl', controllerAs: 'vm'});
	$routeProvider.when('/playback', {templateUrl: 'templates/playbackView.html', controller: 'PlaybackCtrl', controllerAs: 'vm'});
	$routeProvider.when('/story', {templateUrl: 'templates/passageView.html', controller: 'StoryCtrl', controllerAs: 'vm'});
	$routeProvider.when('/profiles', {templateUrl: 'templates/profilesView.html', controller: 'ProfilesCtrl', controllerAs: 'vm'});
	$routeProvider.otherwise({redirectTo: '/stories'});
}]);