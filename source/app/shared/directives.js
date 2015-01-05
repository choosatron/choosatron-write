angular.module('storyApp.directives')
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

					$('#confirmModal .confirm_message').html(attrs.confirmMessage);

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

					var choices = passage.choices ? passage.choices.length : 0;
					var verb = 'Links to ';
					var noun = 'a passage with ';
					var count = '';
					if (choices == 0) {
						count = ' no choices.';
					}
					else if (choices == 1) {
						count = ' one choice.';
					}
					else {
						count = choices + ' choices';
					}

					if (passage.hasAppend()) {
						subject = 'Appends to ';
						choices = 'a';
					}

					if (passage.hasEnding()) {
						$element.attr('data-ending', passage.endingValue);
						noun = 'an ending passage with ';
					} else {
						$element.removeAttr('data-ending');
					}

					var direction = $element.hasClass('passageBack') ? 'left' : 'right';

					$element.attr('data-choices', choices);
					$element.attr('data-toggle', 'tooltip');
					$element.attr('data-placement', 'auto ' + direction);
					$element.attr('title', verb + noun + count);
					$element.tooltip({container: 'body'});
				}, true);
			};
		}
	};
});
