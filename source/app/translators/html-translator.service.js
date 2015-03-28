angular.module('storyApp.translators')
.service('htmlTranslator', [
'Story', '$http',
function(Story, $http) {
	return {
		type: 'html',
		name: 'HTML',
		datatype: 'text/html',

		exportMenuTitle: 'Export to Web Page',
		exports: 'html',
		export: function(aStory) {
			var placeholder = '{{STORY_JSON}}';
			var json = angular.toJson(aStory);
			return $http
			.get('/templates/html-translator.view.html')
			.then(function(rsp) {
				var html = rsp.data.replace(placeholder, json);
				return html;
			});
		}
	};
}]);
