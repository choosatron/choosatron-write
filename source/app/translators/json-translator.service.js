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
		import: function(aData) {
			var json = angular.fromJson(aData);
			return new Story(json);
		},

		exportMenuTitle: 'Export to JSON',
		exports: 'json',
		export: function(aStory) {
			return aStory.serialize(true);
		}
	};
}]);
