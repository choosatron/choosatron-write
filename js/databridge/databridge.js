// The data module is a bridge between the storage and the various 
// things tracked by the app
angular.module('storyApp.databridge')
.service('$stories', ['Storage', '$storageEngine', 
	function(Storage, $storageEngine) {
		return new Storage($storageEngine, 'choosatron/stories');
	}
])
.service('$preferences', ['Storage', '$storageEngine',
	function(Storage, $storageEngine) {
		return new Storage($storageEngine, 'choosatron/preferences/');
	}
])
.service('$story', ['Shared', 
	function(Shared) {
		return new Shared();
	}
])
.service('$passage', ['Shared', 
	function(Shared) {
		return new Shared();
	}
])
