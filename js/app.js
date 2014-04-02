var app = angular.module('storyApp', ['filters'])

.value('storiesNamespace',     'choosatron/stories/')
.value('preferencesNamespace', 'choosatron/preferences/')

.service('$file', ['$http', File])

.provider('$storageEngine', ['$qProvider', StorageEngineProvider])
//.config(function($storageEngineProvider) {$storageEngineProvider.preferSyncStorage(true);})

.service('$stories', ['$storageEngine', 'storiesNamespace', Storage])
.service('$autosave', ['$stories', '$timeout', AutoSave])
.service('$preferences', ['$storageEngine', 'preferencesNamespace', Storage])

.controller('StoryCtrl', ['$scope', '$autosave', '$stories', '$preferences', '$file', StoryCtrl]);
