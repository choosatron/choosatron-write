angular.module('storyApp.filters', []);
angular.module('storyApp.directives', []);
angular.module('storyApp.utils', []);
angular.module('storyApp.storage', ['storyApp.utils']);
angular.module('storyApp.databridge', ['storyApp.storage']);
angular.module('storyApp.models', ['storyApp.utils']);
angular.module('storyApp.translators', ['storyApp.utils', 'storyApp.models']);
angular.module('storyApp.controllers', ['storyApp.models', 'storyApp.databridge', 'storyApp.translators']);

angular.module('storyApp', [
	'storyApp.filters',
	'storyApp.directives',
	'storyApp.controllers',
	'ngAnimate',
	'ngRoute',
	'ui.utils'
])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/stories', {templateUrl: 'templates/stories.html', controller: 'StoriesCtrl'});
	$routeProvider.when('/choosatron', {templateUrl: 'templates/choosatron.html', controller: 'ChoosatronCtrl'});
	$routeProvider.when('/playback', {templateUrl: 'templates/playback.html', controller: 'PlaybackCtrl'});
	$routeProvider.when('/story', {templateUrl: 'templates/passage.html', controller: 'StoryCtrl'});
	$routeProvider.when('/profiles', {templateUrl: 'templates/profiles.html', controller: 'ProfilesCtrl'});
	$routeProvider.otherwise({redirectTo: '/stories'});
}]);
