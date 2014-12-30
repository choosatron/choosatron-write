/**
 *¬This is the controller responsible for talking with the Choosatron!
**/
angular.module('storyApp.controllers')

.controller('ChoosatronCtrl',  ['$scope', '$location', '$profiles',
function($scope, $interval, $location, $profiles) {
	$profiles.load().then(function () {
		$scope.choosatrons = $profiles.current.choosatrons;

		/*var profile = $profiles.current;
		if (!profile) {
			console.error("No profiles selected. Redirecting to ./profiles");
			return $location.path('profiles');
		}

		var choosatrons = profile.choosatrons;
		if (!choosatrons || choosatrons.length == 0) {
			console.error("Profile has no Choosatrons. Redirecting to ./stories");
			return $location.path('stories');
		}*/

	});

	$scope.view = function() {
		$location.path('choosatrons');
	}
}])

.controller('ChoosatronsCtrl',  ['$scope', '$location', '$profiles', 'Choosatron',
function($scope, $location, $profiles, Choosatron) {
	var vm = this;

	vm.state = 'disk';

	$profiles.load().then(function() {
		vm.choosatrons = $profiles.current.choosatrons;
		/*var test = new Choosatron();
		test.name = "Pickles";
		test.ownerName = $profiles.current.name;
		test.coreId = '53ff6b065067544835331287';
		vm.choosatrons.push(test);*/
		$scope.$watchGroup(['vm.choosatrons.current.name', 'vm.choosatrons.current.coreId'],
		                   function(newValues, oldValues, scope) {
			vm.state = 'save';
		});
	});

	vm.newChoosatron = function() {
		console.log("Create new Choosatron profile.");
	};

	vm.releaseClaim = function() {
		console.log("Release claim on Choosatron.");
	};

	vm.saveChoosatron = function() {
		$choosatrons.save()
		.then(function() {
			vm.saveState = 'saved';
		});
	};


	// Filter for verified devices.
	vm.verifiedChoosatron = function (item) {
		return (item.verified);
	};

}]);
