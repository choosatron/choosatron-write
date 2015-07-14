(function() {

'use strict';

angular.module('storyApp')
.factory('TcpConnection', ['$q', 'ArrayBufferFactory', function($q, ArrayBufferFactory) {

	var tcp = chrome.sockets.tcp;

	function TcpConnection(ip, port) {
		this.ip     = ip;
		this.port   = port;
		this.socket = null;
	}


	TcpConnection.prototype.create = function() {
		var deferred = $q.defer();
		var self     = this;

		function created(info) {
			self.socket = info;
			deferred.resolve();
		}

		tcp.create({persistent: false}, created);

		return deferred.promise;
	};


	TcpConnection.prototype.open = function() {
		var deferred = $q.defer();
		var self     = this;

		function connect() {
			tcp.connect(self.socketId, self.ip, self.port, connected);
		}

		function connected(result) {
			deferred.resolve(result);
		}

		if (!this.socket) {
			this.create().then(connect, deferred.reject);
		}
		else {
			connect();
		}

		return deferred.promise;
	};


	TcpConnection.prototype.close = function() {
		var deferred = $q.defer();
		if (!this.socket) {
			deferred.reject('No connection');
		}
		else {
			tcp.close(this.socket.socketId, deferred.resolve);
		}
		return deferred.promise;
	};


	TcpConnection.prototype.send = function(buffer) {
		var deferred = $q.defer();
		var self     = this;

		if (!(buffer instanceof ArrayBuffer)) {
			buffer = ArrayBufferFactory.fromString(buffer);
		}

		function send() {
			tcp.send(self.socket.socketId, buffer, deferred.resolve);
		}

		if (!this.socket) {
			this.open().then(send);
		}
		else {
			send();
		}

		return deferred.promise;
	};

	return TcpConnection;

}]);

})();
