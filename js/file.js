function File($http) {
	this.$http = $http;
}

File.prototype = {
	export: function(filename, data, type) {
		var a      = document.createElement('a');
		a.href     = 'data:attachment/' + type + ',' + encodeURI(data);
		a.target   = '_blank';
		a.download = filename;
		document.body.appendChild(a);
		a.click();
	}, 

	read: function(url) {
		return this.$http.get(url);
	},

	export_file: function (filename, extension, data, type) {
		function errorHandler(arguments) {
			console.error(chrome.runtime.lastError, arguments);
		}

		chrome.fileSystem.chooseEntry(
			{
				type: 'saveFile',
				suggestedName: filename,
				accepts: [{extensions: [extension]}]
			},
			function (writableFileEntry) {
				if (!writableFileEntry) return;
				writableFileEntry.createWriter(function (writer) {
					writer.onerror = errorHandler;
					writer.onwriteend = function (e) {
						console.info('file write complete');
					};

					writer.write(new Blob([data], {type: type}));
				}, errorHandler);
			}
		);
	}
};
