angular.module('storyApp.translators')
.factory('$translators', ['$file', '$q', 
'JsonTranslator', 'TwineTranslator', 'ChoosatronTranslator', 'InkleTranslator', 
function($file, $q) {
	var classes = Array.prototype.splice.call(arguments, 2); 

	return {
		all: function() {
			return classes;
		},

		get: function(type) {
			return classes.find(function(c) {
				if (c.type == type) {
					return c;
				}
			});
		},

		read: function(type, entry) {
			var deferred = $q.defer();
			var translator = this.get(type);

			if (!translator) {
				deferred.reject(new Error("No translator for type: " + type));
				return deferred.promise;
			}

			entry.id = $file.getEntryId(entry);

			$file.read(entry)
			.then(function(data) {
				var story = translator.import(data);
				if (story) story.refresh_id();
				var result = {
					story: story,
					entry: entry
				};
				deferred.resolve(result);
			}, deferred.reject);

			return deferred.promise;
		},

		restore: function(type, entryId) {
			var deferred = $q.defer();

			var read = this.read.bind(this, type);
			$file.restore(entryId)
			.then(function(entry) {
				read(entry).then(deferred.resolve, deferred.reject);
			}, deferred.reject);

			return deferred.promise;
		},

		import: function(type, callback) {
			var deferred = $q.defer();
			var translator = this.get(type);
			var supported = translator.imports;
			var read = this.read.bind(this);

			$file.open(supported)
			.then(function(entry) {
				if (!entry) return deferred.resolve(null);
				read(type, entry).then(deferred.resolve, deferred.reject);
			}, deferred.reject);

			return deferred.promise;
		},

		export: function(type, story) {
			var translator = this.get(type);
			var extension = translator.exports;
			var datatype = translator.datatype;
			var data = translator.export(story);

			return $file.export(story.title, extension, data, datatype);
		}
	};
}]);
