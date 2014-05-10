angular.module('storyApp.utils')
.service('$file', ['$q', function($q, fs, runtime) {
	fs = fs || chrome.fileSystem;
	runtime = runtime || chrome.runtime;

	this.getEntryId = function(entry) {
		return fs.retainEntry(entry);
	};

	this.restore = function(entryId) {
		var deferred = $q.defer();
		fs.isRestorable(entryId, function(restorable) {
			if (!restorable) {
				return deferred.reject("Invalid entry id");
			}
			fs.restoryEntry(entryId, deferred.resolve);
		});
		return deferred.promise;
	};

	this.write = function(entry, data, type) {
		var deferred = $q.defer();
		type = type || 'text/plain';

		var done = function(writer) {
			writer.truncate(this.position);
			deferred.resolve(writer);
		};

		entry.createWriter(function(writer) {
			writer.onwriteend = done;
			writer.write(new Blob([data], {type: type}));
		}, deferred.reject);

		return deferred.promise;
	};

	this.read = function(entry) {
		var deferred = $q.defer();
		var reader = new FileReader();

		reader.onload = function(data) {
			deferred.resolve(data.target && data.target.result);
		};

		entry.file(function(file) {
			reader.readAsText(file);
		}, deferred.reject);

		return deferred.promise;
	};

	this.open = function(extensions) {
		var deferred = $q.defer();

		var args = {type: 'openFile'};
		if (extensions) args.accepts = [{extensions: extensions}];

		fs.chooseEntry(args, function(entry) {
			if (!runtime.lastError) {
				deferred.resolve(entry);
			}
			else {
				deferred.reject(runtime.lastError);
			}
		});

		return deferred.promise;
	};

	this.export = function (filename, extension, data, type) {
		var deferred = $q.defer();
		var write = this.write;

		var chosen = function(entry) {
			if (!entry) {
				return deferred.resolve(null);
			}

			write(entry, data, type)
			.then(deferred.resolve, deferred.reject);
		};

		var args = {
			type: 'saveFile',
			suggestedName: filename,
			accepts: [{extensions: [extension]}]
		};

		fs.chooseEntry(args, chosen);

		return deferred.promise;
	};
}]);
