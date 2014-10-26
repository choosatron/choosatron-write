/**
 *¬This is the controller responsible for talking with the Choosatron!
**/
angular.module('storyApp.controllers')
.controller('ChoosatronCtrl',  ['$scope', '$location', '$translators', 'Usb', 'Story',
function ChoosatronCtrl($scope, $location, $translators, Usb, Story) {
	$scope.location = $location;

	$scope.connect = function() {
		Usb.connect()
		.then(function(list) {
			$scope.devices = list;
			$scope.scanned = true;
		});
	};
}]);
