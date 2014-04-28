angular.module('storyApp.translators')
.service('InkleTranslator', [
'Story',
function(Story) {
	return {
		type: 'inkle',
		name: 'Inkle',
		datatype: 'text/javascript',

		importMenuTitle: 'Import from Inkle File',
		imports: [ 'json' ],
		import: function(data) {

		},

		exportMenuTitle: 'Export to Inkle',
		exports: 'json',
		export: function(story) {

		}
	};
}]);
