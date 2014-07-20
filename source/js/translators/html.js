angular.module('storyApp.translators')
.service('HtmlTranslator', [
'Story', '$http',
function(Story, $http) {
	return {
		type: 'html',
		name: 'HTML',
		datatype: 'text/html',

		exportMenuTitle: 'Export to Web Page',
		exports: 'html',
		export: function(story) {
			var placeholder = '{{STORY_JSON}}';
			var json = angular.toJson(story);
			return $http
			.get('/templates/html.html')
			.then(function(rsp) {
				var html = rsp.data.replace(placeholder, json);;
				return html;
			});
		}
	}
}]);
