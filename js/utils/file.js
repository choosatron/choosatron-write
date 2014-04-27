angular.module('storyApp.utils')
.service('$file', ['EventHandler', function(EventHandler) {
	this.events = EventHandler.create('error', 'cancel', 'open', 'read', 'write');
	this.events.async = true;

	this.on = function(event, callback) {
		this.events.on(event, callback);
	};

	this.open = function(extensions, callback) {
		var events = this.events;
		var onOpen = function(entry) {
			if (!entry) {
				events.fire('cancel');
				if (callback) callback.apply(self, arguments);
				return;
			}
			events.fire('open', entry);
			var reader = new FileReader();

			reader.onerror = function(e) {
				events.fire('error', e);
			};
			reader.onload = function(data) {
				var result = data.target && data.target.result;
				events.fire('read', result, entry, data);
				if (callback) callback.call(self, result, entry, data);
			};
			entry.file(function(file) {
				reader.readAsText(file);
			}, function(e) {
				events.fire('error', e);
			});
		};
		var args = {type: 'openFile'};
		if (extensions) args.accepts = [{extensions: extensions}];
		chrome.fileSystem.chooseEntry(args, onOpen);
	};

	this.export = function (filename, extension, data, type) {
		var events = this.events;
		var write = function(entry) {
			if (!entry) {
				events.fire('cancel');
				return;
			}
			var fe = function(e) {
				events.fire('error', e);
			};
			var fw = function(w) {
				events.fire('write', w);
			};
			entry.createWriter(function(writer) {
				writer.onerror    = fe;
				writer.onwriteend = fw;
				writer.write(new Blob([data], {type: type}));
			}, self.fireError);
		};
		var args = {
			type: 'saveFile',
			suggestedName: filename,
			accepts: [{extensions: [extension]}]
		};
		chrome.fileSystem.chooseEntry(args, write);
	};
}]);
