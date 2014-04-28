// The data module is a bridge between the storage and the various 
// things tracked by the app
angular.module('storyApp.databridge')
.service('$stories', ['ChromeStorageEngine', 'Storage',
	function(ChromeStorageEngine, Storage) {
		var engine = new ChromeStorageEngine();
		return new Storage(engine, 'choosatron/stories');
	}
])
.service('$preferences', ['ChromeStorageEngine', 'Storage',
	function(ChromeStorageEngine, Storage) {
		var engine = new ChromeStorageEngine();
		return new Storage(engine, 'choosatron/preferences/');
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
