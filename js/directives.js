angular.module('storyApp.directives', [])
.directive('confirmClick', ['$parse', function ($parse) {
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
}])

.directive('passageIcons', function () {
	return {
		compile: function($templateElement, $templateAttributes) {
			return function ($scope, $element, attrs) {
				$scope.$watch(attrs.passageIcons, function (value) {
					var passage = $scope.$eval(attrs.passageIcons);

					if (!passage) {
						return;
					}

					var choices = passage.choices.length;

					if (passage.has_append()) {
						choices = 'a';
					}

					$element.attr('data-choices', choices);

					if (passage.has_ending()) {
						$element.attr('data-ending', passage.ending_value);

					} else {
						$element.removeAttr('data-ending');
					}
				}, true);
			};
		}
	};
});
