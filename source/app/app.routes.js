angular.module('storyApp')
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/stories', {templateUrl: 'stories/storiesView.html', controller: 'StoriesCtrl'});
	$routeProvider.when('/choosatron', {templateUrl: 'choosatrons/choosatronsView.html', controller: 'ChoosatronsCtrl', controllerAs: 'vm'});
	$routeProvider.when('/playback', {templateUrl: 'stories/playback/playbackView.html', controller: 'PlaybackCtrl'});
	$routeProvider.when('/story', {templateUrl: 'stories/passages/passageView.html', controller: 'StoryCtrl'});
	$routeProvider.when('/profiles', {templateUrl: 'profiles/profilesView.html', controller: 'ProfilesCtrl', controllerAs: 'vm'});
	$routeProvider.otherwise({redirectTo: '/stories'});
}]);