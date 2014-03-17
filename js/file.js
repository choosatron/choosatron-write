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

	export_binary: function (filename, extension, byteData) {
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
				writableFileEntry.createWriter(function (writer) {
					writer.onerror = errorHandler;
					writer.onwriteend = function (e) {
						console.info('file write complete');
					};

					// Write out binary data to the file
					writer.write(new Blob([byteData], {type: 'application/octet-stream'}));  
				}, errorHandler);
			}
		);
	}
};
