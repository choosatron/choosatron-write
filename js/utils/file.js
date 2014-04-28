angular.module('storyApp.utils')
.service('$file', ['$q', 'EventHandler', function($q, EventHandler, fs) {
	fs = fs || chrome.fileSystem;

	this.events = EventHandler.create('error', 'cancel', 'open', 'read', 'write');
	this.events.async = true;

	this.on = function(event, callback) {
		this.events.on(event, callback);
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

		entry.createWriter(function(writer) {
			writer.onwriteend = deferred.resolve;
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

	this.open = function(extensions, callback) {
		var deferred = $q.defer();

		var events = this.events;
		var read   = this.read;

		var onOpen = function(entry) {
			if (!entry) {
				events.fire('cancel');
				if (callback) callback.apply(self, null);
				return deferred.resolve(null);
			}
			events.fire('open', entry);
			read(entry).then(function(data) {
				events.fire('read', data, entry);
				if (callback) callback.call(self, data, entry);
				return deferred.resolve({data: data, entry: entry});
			}, function(e) {
				events.fire('error', e);
			});
		};
		var args = {type: 'openFile'};

		if (extensions) args.accepts = [{extensions: extensions}];
		fs.chooseEntry(args, onOpen);

		return deferred.promise;
	};

	this.export = function (filename, extension, data, type, callback) {
		var deferred = $q.defer();
		var events = this.events;
		var write = this.write;

		var chosen = function(entry) {
			if (!entry) {
				events.fire('cancel');
				return deferred.resolve(null);
			}

			write(entry, data, type)
			.then(function(w) {
				events.fire('write', w);
				if (callback) callback(w);
				return deferred.resolve(w);
			},
			function(e) {
				events.fire('error', e);
				return deferred.reject(e);
			});
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
