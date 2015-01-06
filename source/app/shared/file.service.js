angular.module('storyApp.utils')
.service('file', ['$q', function($q, fs, runtime) {
	fs = fs || chrome.fileSystem;
	runtime = runtime || chrome.runtime;

	var tryResolve = function(deferred, data) {
		if (!runtime.lastError) {
			deferred.resolve(data);
		}
		else {
			deferred.reject(runtime.lastError);
		}
	};

	this.getEntryId = function(entry) {
		return fs.retainEntry(entry);
	};

	this.restore = function(entryId) {
		var deferred = $q.defer();
		fs.isRestorable(entryId, function(restorable) {
			if (!restorable) {
				return deferred.reject("Invalid entry id");
			}
			fs.restoreEntry(entryId, function(entry) {
				tryResolve(deferred, entry);
			});
		});
		return deferred.promise;
	};

	this.write = function(entry, data, type) {
		var deferred = $q.defer();
		type = type || 'text/plain';

		entry.createWriter(function(writer) {
			var blob = new Blob([data]);
			writer.onerror = deferred.reject;
			writer.onwriteend = function(event) {
				if (writer.length == blob.size) {
					return deferred.resolve(event);
				}
				else {
					writer.write(blob, {type: type});
				}
			};
			writer.truncate(0);
		}, deferred.reject);

		return deferred.promise;
	};

	this.read = function(entry) {
		var deferred = $q.defer();
		var reader = new FileReader();

		reader.onload = function(data) {
			deferred.resolve(data.target && data.target.result);
		};

		reader.onerror = function(e) {
			deferred.reject(e);
		};

		entry.file(function(file) {
			reader.readAsText(file);
		}, deferred.reject);

		return deferred.promise;
	};

	this.choose = function(args) {
		var deferred = $q.defer();

		fs.chooseEntry(args, function(entry) {
			tryResolve(deferred, entry);
		});

		return deferred.promise;
	};

	this.create = function(extension, filename) {
		var args = {type: 'saveFile'};
		if (filename) args.suggestedName = filename;
		if (extension) args.accepts = [{extensions: [extension]}];
		return this.choose(args);
	};

	this.open = function(extensions) {
		var args = {type: 'openFile'};
		if (extensions) {
			args.accepts = [{extensions: extensions}];
		}
		return this.choose(args);
	};

	this.export = function (filename, extension, data, type) {
		var deferred = $q.defer();
		var write = this.write;

		var chosen = function(entry) {
			if (!entry) {
				return deferred.resolve(null);
			}
			else if (runtime.lastError) {
				return deferred.reject(runtime.lastError);
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
