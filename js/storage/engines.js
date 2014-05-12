angular.module('storyApp.storage')
.factory('BaseStorageEngine', ['$q',
function ($q) {
	return function BaseStorageEngine() {
		this.area = {};
		this.throttle = 100; // ms

		this.toJson = function(o) {
			return angular.toJson(o);
		};

		this.fromJson = function(s) {
			try {
				return angular.fromJson(s);
			}
			catch (e) {
				console.error("Error decoding data", e);
				return null;
			}
		};

		this.getItem = function(namespace, key) {
			var deferred = $q.defer();
			var value = this.area[namespace];
			if (key) {
				value = value && value[key];
			}
			deferred.resolve(value);
			return deferred.promise;
		};

		this.setItem = function(namespace, key, value) {
			var deferred = $q.defer();
			if (!this.area[namespace]) {
				this.area[namespace] = {};
			}
			this.area[namespace][key] = value;
			deferred.resolve(value);
			return deferred.promise;
		};

		this.deleteItem = function(namespace, key) {
			var deferred = $q.defer();
			if (this.area[namespace]) {
				delete this.area[namespace][key];
			}
			deferred.resolve();
			return deferred.promise;
		};
	}
}])

.factory('FileSystemStorageEngine', ['$q', 'BaseStorageEngine', '$file',
function($q, BaseStorageEngine, $file) {
	return function FileSystemStorageEngine(extensions, type) {
		BaseStorageEngine.call(this, $q);

		this.extensions = extensions;
		this.type = type;
		this.throttle = 1000; // 1 second between saves

		// The "area" in this case is used to track references between internal ids and entry or the entries
		this.area = {};

		this.getEntry = function(namespace, key) {
			var deferred = $q.defer();
			var self = this;

			if (!this.area[namespace]) {
				this.area[namespace] = {};
			}

			if (!key) {
				deferred.resolve(this.area[namespace]);
				return deferred.promise;
			}

			var entry = key && this.area[namespace][key];

			if (typeof(entry) == 'object') {
				deferred.resolve(entry);
			}
			else if (entry) {
				$file.restore(entry)
				.then(function(entry) {
					self.area[namespace][key] = entry;
					deferred.resolve(entry);
				}, function(e) {
					delete self.area[namespace][key];
					// Call again if there's an error restoring the id
					self.getEntry(namespace, key).then(deferred.resolve, deferred.reject);
				});
			}
			else {
				$file.open(this.extensions)
				.then(function(entry) {
					self.area[namespace][key] = entry;
					deferred.resolve(entry);
				}, deferred.reject);
			}

			return deferred.promise;
		};

		this.getItem = function(namespace, key) {
			var deferred = $q.defer();
			var self = this;

			this.getEntry(namespace, key)
			.then(function(entry) {
				if (typeof entry == 'FileEntry') {
					$file.read(entry)
					.then(function(text) {
						deferred.resolve(self.fromJson(text));
					}, deferred.reject);
				}
				else {
					deferred.resolve(entry);
				}
			}, deferred.reject);

			return deferred.promise;
		};

		this.setItem  =  function(namespace, key, value) {
			var deferred = $q.defer();
			var self = this;

			value = this.toJson(value);

			this.getEntry(namespace, key)
			.then(function(entry) {
				$file.write(entry, value, self.type)
				.then(deferred.resolve, deferred.reject);
			}, deferred.reject);

			return deferred.promise;
		};

		this.deleteItem = function(namespace, key) {
			throw new Error("Cannot delete items in the filesystem");
		};
	}
}])

.factory('LocalStorageEngine', ['$q', 'BaseStorageEngine',
function($q, BaseStorageEngine) {
	return function LocalStorageEngine() {
		BaseStorageEngine.call(this, $q);

		this.area = window.localStorage;

		this.getItem = function(namespace, key) {
			var deferred = $q.defer();
			var self = this;
			var result = this.area.getItem(namespace);
			if (key) {
				var value = result && result[key];
				deferred.resolve(self.fromJson(value));
			}
			else {
				deferred.resolve(self.fromJson(result));
			}
			return deferred.promise;
		};

		this.setItem = function(namespace, key, value) {
			var deferred = $q.defer();
			var self = this;

			this.getItem(namespace)
			.then(function(data) {
				data[key] = value;
				self.area.setItem(namespace, self.toJson(data));
				deferred.resolve(value);
			}, deferred.reject);

			return deferred.promise;
		};

		this.deleteItem = function(namespace, key) {
			var deferred = $q.defer();
			var self = this;

			this.getItem(namespace)
			.then(function(data) {
				if (data) {
					delete data[key];
					self.area.setItem(namespace, self.toJson(data));
				}
				deferred.resolve();
			}, deferred.reject);

			return deferred.promise;
		};
	}
}])

.factory('ChromeStorageEngine', ['$q', 'BaseStorageEngine',
function($q, BaseStorageEngine) {
	return function ChromeStorageEngine() {
		BaseStorageEngine.call(this, $q);

		this.area = chrome.storage.local;

		this.getItem = function(namespace, key) {
			var deferred = $q.defer();
			var self = this;
			var cb = function(items) {
				if (chrome.runtime.lastError) {
					return deferred.reject(chrome.runtime.lastError);
				}
				var data = self.fromJson(items[namespace]);
				if (key) {
					deferred.resolve(data && data[key]);
				}
				else {
					deferred.resolve(data);
				}
			};
			this.area.get(namespace, cb);
			return deferred.promise;
		}

		this.setItem = function(namespace, key, value) {
			var deferred = $q.defer();
			var self = this;

			this.getItem(namespace)
			.then(function(items) {
				if (chrome.runtime.lastError) {
					return deferred.reject(chrome.runtime.lastError);
				}
				if (!items) {
					items = {};
				}
				items[key] = value;
				var data = {};
				data[namespace] = self.toJson(items);

				self.area.set(data, function() {
					if (chrome.runtime.lastError) {
						return deferred.reject(chrome.runtime.lastError);
					}
					deferred.resolve(value);
				});
			}, deferred.reject);

			return deferred.promise;
		}

		this.deleteItem = function(namespace, key) {
			var deferred = $q.defer();
			var self = this;

			this.getItem(namespace)
			.then(function(items) {
				if (chrome.runtime.lastError) {
					return deferred.reject(chrome.runtime.lastError);
				}
				if (!items) {
					return deferred.resolve();
				}
				delete items[key];
				var data = {};
				data[namespace] = self.toJson(data);
				self.area.set(data, function() {
					if (chrome.runtime.lastError) {
						return deferred.reject(chrome.runtime.lastError);
					}
					deferred.resolve();
				});
			}, deferred.reject);

			return deferred.promise;

		};
	}
}])


.factory('ChromeSyncStorageEngine', ['$q', 'ChromeStorageEngine',
function($q, ChromeStorageEngine) {
	return function ChromeSyncStorageEngine() {
		ChromeStorageEngine.call(this, $q);
		this.area = chrome.storage.sync;

		// Each change within the throttle time bumps the save action out slightly.
		// Chrome.sync storage has a max sustained save operation of 10 writes/minute
		this.throttle = 6000; // ms
	}
}]);
