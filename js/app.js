var app = angular.module('storyApp', ['storyApp.filters', 'storyApp.directives', 'ngRoute'])

.value('storiesNamespace',     'choosatron/stories/')
.value('preferencesNamespace', 'choosatron/preferences/')

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/playback', {templateUrl: 'templates/playback.html', controller: 'PlaybackCtrl'});
	$routeProvider.when('/stories', {templateUrl: 'templates/stories.html', controller: 'StoriesCtrl'});
	$routeProvider.when('/story', {templateUrl: 'templates/passage.html', controller: 'StoryCtrl'});
	$routeProvider.otherwise({redirectTo: '/stories'});
}])

.service('$file', ['$http', File])
.service('$story', Shared)
.service('$passage', Shared)

.provider('$storageEngine', ['$qProvider', StorageEngineProvider])
//.config(function($storageEngineProvider) {$storageEngineProvider.preferSyncStorage(true);})

.service('$stories', ['$storageEngine', 'storiesNamespace', Storage])
.service('$autosave', ['$stories', '$timeout', AutoSave])
.service('$preferences', ['$storageEngine', 'preferencesNamespace', Storage])

.controller('StoriesCtrl', ['$scope', '$location', '$autosave', '$stories', '$preferences', '$file', '$story', '$passage', StoriesCtrl])
.controller('StoryCtrl', ['$scope', '$location', '$autosave', '$stories', '$preferences', '$file', '$story', '$passage', StoryCtrl])
.controller('PlaybackCtrl', ['$scope', '$location', '$story', '$passage', PlaybackCtrl]);
