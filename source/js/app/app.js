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
	'ui.utils',
	'ngDialog'
])

angular.module('storyApp')
.config(['ngDialogProvider', function(ngDialogProvider) {
	ngDialogProvider.setDefaults({
		className: 'ngdialog-theme-default',
		plain: false,
		showClose: true,
		closeByDocument: true,
		closeByEscape: true
	});
}])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/stories', {templateUrl: 'templates/stories.html', controller: 'StoriesCtrl'});
	$routeProvider.when('/choosatron', {templateUrl: 'templates/choosatronsView.html', controller: 'ChoosatronsCtrl', controllerAs: 'vm'});
	$routeProvider.when('/playback', {templateUrl: 'templates/playback.html', controller: 'PlaybackCtrl'});
	$routeProvider.when('/story', {templateUrl: 'templates/passage.html', controller: 'StoryCtrl'});
	$routeProvider.when('/profiles', {templateUrl: 'templates/profilesView.html', controller: 'ProfilesCtrl', controllerAs: 'vm'});
	$routeProvider.otherwise({redirectTo: '/stories'});
}]);
