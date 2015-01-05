angular.module('storyApp.storage')
.factory('fileEntryAutoSave', ['autoSave', 'storage', 'fileSystemStorageEngine',
function(autoSave, storage, fileSystemStorageEngine) {

	var namespace = 'autoSave';
	var engine = new fileSystemStorageEngine();
	engine.area[namespace] = {};

	var storage = new storage(engine, namespace);

	function fileEntryAutoSave(id, entry, $scope) {
		engine.area[namespace][id] = entry;
		autoSave.call(this, storage, $scope);
	};

	fileEntryAutoSave.prototype = Object.create(autoSave.prototype);
	fileEntryAutoSave.prototype.constructor = fileEntryAutoSave;

	return fileEntryAutoSave;
}]);
