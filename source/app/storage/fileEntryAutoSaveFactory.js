angular.module('storyApp.storage')
.factory('fileEntryAutoSave', ['autoSave', 'storage', 'fileSystemStorageEngine',
function(autosave, storage, fileSystemStorageEngine) {

	var namespace = 'autoSave';
	var engine = new fileSystemStorageEngine();
	engine.area[namespace] = {};

	var storage = new Storage(engine, namespace);

	function fileEntryAutoSave(id, entry, $scope) {
		engine.area[namespace][id] = entry;
		AutoSave.call(this, storage, $scope);
	};

	fileEntryAutoSave.prototype = Object.create(AutoSave.prototype);
	fileEntryAutoSave.prototype.constructor = fileEntryAutoSave;

	return FileEntryAutoSave;
}]);
