var app = angular.module('storyApp', ['storyApp.filters', 'storyApp.directives', 'ngRoute'])
	.value('storiesNamespace',     'choosatron/stories/')
	.value('preferencesNamespace', 'choosatron/preferences/')

	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/playback', {templateUrl: 'templates/playback.html', controller: 'PlaybackCtrl'});
		$routeProvider.when('/stories', {templateUrl: 'templates/stories.html', controller: 'StoriesCtrl'});
		$routeProvider.when('/story', {templateUrl: 'templates/passage.html', controller: 'StoryCtrl'});
		$routeProvider.otherwise({redirectTo: '/stories'});
	}])

	.provider('$storageEngine', ['$qProvider', StorageEngineProvider])
	//.config(function($storageEngineProvider) {$storageEngineProvider.preferSyncStorage(true);})

	.service('$stories', ['$storageEngine', 'storiesNamespace', Storage])
	.service('$preferences', ['$storageEngine', 'preferencesNamespace', Storage])
	.service('$autosave', ['$stories', '$timeout', AutoSave])

	.service('$file', ['$http', File])
	.service('$story', Shared)
	.service('$passage', Shared)
	.service('$selection', ['$story', '$passage', '$preferences', Selection])

	.controller('StoriesCtrl',  ['$scope', '$location', '$selection', '$autosave', '$stories', '$file', StoriesCtrl])
	.controller('StoryCtrl',    ['$scope', '$location', '$selection', '$autosave', StoryCtrl])
	.controller('PlaybackCtrl', ['$scope', '$location', '$selection', PlaybackCtrl]);
