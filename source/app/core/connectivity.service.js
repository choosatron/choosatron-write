/*app.service('OfflineAuthService', [function () {
	this.saySomething = function(){
		alert("We are Offline");
	};

}])
.service('OnlineAuthService', [function () {
	this.saySomething = function(){
		alert("We are Online");
	};
}]);

registerOnlineOfflineService('AuthService', 'OnlineAuthService', 'OfflineAuthService');


function registerOnlineOfflineService(serviceName, onlineServiceName, offlineServiceName) {

	app.service(serviceName, ['$rootScope', onlineServiceName, offlineServiceName,
	function($rootScope, onlineService, offlineService){
		var Service = {};

		function useOnlineImplementation() {
			angular.copy(onlineService, Service);
		}

		function useOfflineImplementation() {
			angular.copy(offlineService, Service);
		}

		$rootScope.$watch('isOnline', function(isOnline) {
			console.log("Switching Implmentation");
			if (isOnline){
				useOnlineImplementation();
			} else {
				useOfflineImplementation();
			}
		});

		return Service;
	}]);
}*/