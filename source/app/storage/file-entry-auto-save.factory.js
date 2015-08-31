angular.module('storyApp.storage')
.factory('FileEntryAutoSave', ['AutoSave', 'Storage', 'FileSystemStorageEngine',
function(AutoSave, Storage, FileSystemStorageEngine) {

	var namespace = 'AutoSave';
	var engine = new FileSystemStorageEngine();
	engine.area[namespace] = {};

	var storage = new Storage(engine, namespace);

	function FileEntryAutoSave(aId, aEntry, $scope) {
		engine.area[namespace][aId] = aEntry;
		AutoSave.call(this, storage, $scope);
	}

	FileEntryAutoSave.prototype = Object.create(AutoSave.prototype);
	FileEntryAutoSave.prototype.constructor = FileEntryAutoSave;

	return FileEntryAutoSave;
}]);
