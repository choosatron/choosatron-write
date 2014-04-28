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

	var events = EventHandler.create('imported', 'exported');
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

		import: function(type) {
			var translator = this.get(type);
			var supported = translator.imports;
			var self = this;
			var read = function(text, entry, info) {
				var story = translator.import(text);
				if (story) story.refresh_id();
				self.fire('imported', story);
			};
			$file.open(supported, read);
		},

		export: function(type, story) {
			var translator = this.get(type);
			var extension = translator.exports;
			var datatype = translator.datatype;
			var data = translator.export(story);
			var self = this;
			$file.export(story.title, extension, data, datatype, function(writer) {
				self.fire('exported', writer);
			});
		}
	};
}]);
