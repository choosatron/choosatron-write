
app.directive('confirmClick', ['$parse', function ($parse) {
	return {
		compile: function($element, attr) {
			var fn = $parse(attr.confirmClick);

			return function (scope, element, attr) {
				element.on('click', function (event) {
					$('#confirmDelete').off('click.confirmed');
					$('#confirmDelete').one('click.confirmed', function (evt2) {
						scope.$apply(function () {
							fn(scope, {$event: evt2});
						});
					});

					$('#confirmModal').modal('show');
					window.foo = scope;
					window.bar = attr;
					scope.modal.confirm_message = attr.confirmMessage;
				});
			};
		}
	};
}]);


