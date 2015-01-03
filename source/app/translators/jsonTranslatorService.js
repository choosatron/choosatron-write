angular.module('storyApp.translators')
.service('jsonTranslator', [
'Story',
function(Story) {
	return {
		type: 'json',
		name: 'JSON',
		datatype: 'text/javascript',

		importMenuTitle: 'Import from JSON',
		imports: [ 'json' ],
		import: function(data) {
			var json = angular.fromJson(data);
			return new Story(json);
		},

		exportMenuTitle: 'Export to JSON',
		exports: 'json',
		export: function(story) {
			return story.serialize(true);
		}
	}
}]);
