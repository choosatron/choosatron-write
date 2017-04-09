angular.module('storyApp.directives')
.directive('confirmClick', ['ngDialog', function(ngDialog) {

	function openDialog() {
		ngDialog.openConfirm({
			template: 'templates/modal-delete-confirm.view.html',
			scope: this
		}).then(this.action);
	}

	return {
		restrict: 'A',
		scope: {
			message: '@confirmMessage',
			title: '@confirmTitle',
			action:  '&confirmClick'
		},
		link: function(scope, el, attrs) {
			el.on('click', openDialog.bind(scope));
		}
	};
}]);
