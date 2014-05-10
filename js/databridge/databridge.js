// The data module is a bridge between the storage and the various 
// things tracked by the app
angular.module('storyApp.databridge')
// Holds the user preferences on a profile-by-profile basis
.service('$preferences', ['ChromeStorageEngine', 'Storage',
	function(StorageEngine, Storage) {
		var engine = new StorageEngine();
		return new Storage(engine, 'choosatron/preferences');
	}
])
// Indicates the currently selected story
.service('$story', ['Shared', 
	function(Shared) {
		return new Shared();
	}
])
// Indicates the currently selected passage
.service('$passage', ['Shared', 
	function(Shared) {
		return new Shared();
	}
])
;
