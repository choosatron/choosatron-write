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

	var events = EventHandler.create('imported', 'exported', 'error');
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

		import: function(type, callback) {
			var translator = this.get(type);
			var supported = translator.imports;
			var onError = function(e) {
				events.fire('error', e);
			};

			$file.open(supported)
			.then(function(entry) {
				if (!entry) {
					return;
				}
				$file.read(entry)
				.then(function(data) {
					var story = translator.import(data);
					if (story) story.refresh_id();
					if (callback) callback(story);
					events.fire('imported', story);
				}, onError);
			}, onError);
		},

		export: function(type, story) {
			var translator = this.get(type);
			var extension = translator.exports;
			var datatype = translator.datatype;
			var data = translator.export(story);
			$file.export(story.title, extension, data, datatype)
			.then(function(writer) {
				events.fire('exported', writer);
			}, function(e) {
				events.fire('error', e)
			});
		}
	};
}]);
