angular.module('storyApp.storage')
.factory('FileEntryAutoSave', ['autoSave', 'Storage', 'FileSystemStorageEngine',
function(autoSave, Storage, FileSystemStorageEngine) {

	var namespace = 'autoSave';
	var engine = new FileSystemStorageEngine();
	engine.area[namespace] = {};

	var storage = new Storage(engine, namespace);

	function FileEntryAutoSave(id, entry, $scope) {
		engine.area[namespace][id] = entry;
		autoSave.call(this, storage, $scope);
	}

	FileEntryAutoSave.prototype = Object.create(autoSave.prototype);
	FileEntryAutoSave.prototype.constructor = FileEntryAutoSave;

	return FileEntryAutoSave;
}]);
