
app.directive('confirmClick', ['$parse', function ($parse) {
	return {
		compile: function($templateElement, $templateAttributes) {
			var fn = $parse($templateAttributes.confirmClick);

			return function ($scope, $element, attrs) {
				$element.on('click', function (event) {
					$('#confirmDelete').off('click.confirmed');
					$('#confirmDelete').one('click.confirmed', function (evt2) {
						$scope.$apply(function () {
							fn($scope, {$event: evt2});
						});
					});

					$scope.$apply(function () {
						$scope.modal.confirm_message = attrs.confirmMessage;
					});
					
					$('#confirmModal').modal('show');
				});
			};
		}
	};
}]);

app.directive('passageIcons', ['$parse', function ($parse) {
	return {
		compile: function($templateElement, $templateAttributes) {
			return function ($scope, $element, attrs) {
				var passage = ($parse(attrs.passageIcons)($scope));

				if (!passage) {
					return;
				}

				$element.attr('data-choices', passage.choices.length);

				if (passage.has_ending()) {
					$element.attr('data-ending', passage.ending_value);
				}
			};
		}
	};
}]);