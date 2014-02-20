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
	}
};
