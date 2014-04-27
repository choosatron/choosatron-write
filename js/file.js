function File($http) {
	this.listeners = {
		'error'  : [],
		'cancel' : [],
		'open'   : [],
		'read'   : [],
		'write'  : []
	};
	this.$http = $http;
}

File.prototype = {
	on: function(event, callback) {
		this.listeners[event].push(callback);
	},

	fire: function(event) {
		var args = Array.prototype.splice.call(arguments, 1);
		var ctx  = this;
		this.listeners[event].forEach(function(callback) {
			callback.apply(self, args);
		});
	},

	open: function(extensions, callback) {
		var self = this;
		var onOpen = function(entry) {
			if (!entry) {
				self.fire('cancel');
				if (callback) callback.apply(self, arguments);
				return;
			}
			self.fire('open', entry);
			var reader = new FileReader();

			reader.onerror = function(e) {
				self.fire('error', e);
			};
			reader.onload = function(data) {
				var result = data.target && data.target.result;
				self.fire('read', result, entry, data);
				if (callback) callback.call(self, result, entry, data);
			};
			entry.file(function(file) {
				reader.readAsText(file);
			}, function(e) {
				self.fire('error', e);
			});
		};
		var args = {type: 'openFile'};
		if (extensions) args.accepts = [{extensions: extensions}];
		chrome.fileSystem.chooseEntry(args, onOpen);
	},

	export: function (filename, extension, data, type) {
		var self = this;
		var write = function(entry) {
			if (!entry) {
				self.fire('cancel');
				return;
			}
			var fe = function(e) {
				self.fire('error', e);
			};
			var fw = function(w) {
				self.fire('write', w);
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
	}
};
