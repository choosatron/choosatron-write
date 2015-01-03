angular.module('storyApp.filters', []);
angular.module('storyApp.directives', []);
angular.module('storyApp.utils', []);
angular.module('storyApp.storage', ['storyApp.utils']);
angular.module('storyApp.databridge', ['storyApp.storage']);
angular.module('storyApp.models', ['storyApp.utils']);
angular.module('storyApp.translators', ['storyApp.utils', 'storyApp.models']);
angular.module('storyApp.controllers', ['storyApp.models', 'storyApp.databridge', 'storyApp.translators']);

angular.module('storyApp.core', [
	'storyApp.filters',
	'storyApp.directives',
	'storyApp.controllers',
	/* Angular Modules */
	'ngAnimate',
	'ngRoute',
	/* 3rd-Party Modules */
	'ui.utils',
	'ngDialog'
]);