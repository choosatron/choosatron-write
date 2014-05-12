angular.module('storyApp.translators')
.factory('$translators', ['$file', 'EventHandler', 
'JsonTranslator', 'TwineTranslator', 'ChoosatronTranslator', 'InkleTranslator', 
function($file, EventHandler) {
	var classes = Array.prototype.splice.call(arguments, 2); 

	var findTranslator = function(test) {
		var found = null;
		classes.some(function(o, i, a) {
			if (test(o, i)) {
				found = o;
				return true;
			}
			return false;
		});
		return found;
	};

	var events = EventHandler.create('imported', 'exported', 'restored', 'error');
	events.async = true;

	return {
		on: function(events, callback) {
			events.on(events, callback);
		},

		all: function() {
			return classes;
		},

		get: function(type) {
			return findTranslator(function(o) {
				return o.type == type;
			});
		},

		read: function(type, entry, callback) {
			var translator = this.get(type);
			var onError = function(e) {
				events.fire('error', e);
			};
			return $file.read(entry)
			.then(function(data) {
				var story = translator.import(data);
				if (story) story.refresh_id();
				if (callback) callback(story, entry);
			}, onError);
		},

		restore: function(type, entryId, callback) {
			var read = this.read.bind(this);
			var restored = function(entry) {
				read(type, entry, callback)
				.then(function() {
					events.fire('restored', entry);
				});
			};
			return $file.restore(entryId)
			.then(restored.bind(this));
		},

		import: function(type, callback) {
			var translator = this.get(type);
			var supported = translator.imports;
			var read = this.read.bind(this);
			var onError = function(e) {
				events.fire('error', e);
			};

			return $file.open(supported)
			.then(function(entry) {
				if (entry) {
					read(type, entry, callback)
					.then(function() {
						events.fire('imported', entry);
					});
				};
			}, onError);
		},

		export: function(type, story) {
			var translator = this.get(type);
			var extension = translator.exports;
			var datatype = translator.datatype;
			var data = translator.export(story);

			return $file.export(story.title, extension, data, datatype)
			.then(function(writer) {
				events.fire('exported', writer);
			}, function(e) {
				events.fire('error', e)
			});
		}
	};
}]);
