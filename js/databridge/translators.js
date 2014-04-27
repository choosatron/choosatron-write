(function() {

angular.module('storyApp.databridge')
.factory('$translators', function() {
	var classes = [
		{
			type  : 'json',
			class : JsonTranslator
		},
		{
			type  : 'twee',
			class : TwineTranslator
		},
		{
			type  : 'bin',
			class : BinaryTranslator
		},
		{
			type  : 'inkle',
			class : InkleTranslator
		}
	];

	classes.findTranslator = function(test) {
		var found = null;
		this.some(function(o, i, a) {
			if (test(o, i)) {
				found = o;
				return true;
			}
			return false;
		});
		return found.class;
	};

	var unique = function(value) {
		if (this[value]) return false;
		return this[value] = true;
	};

	return {
		all: function() {
			return classes;
		},

		extensions: function() {
			var exts = classes.reduce(function(pv, cv, ix, a) {
				return pv.concat(cv.class.extensions);
			}, []);
			return exts.filter(unique, {});
		},

		get: function(type) {
			return classes.findTranslator(function(o) {
				return o.type == type;
			});
		},

		getForFile: function(text, filename) {
			return classes.findTranslator(function(o) {
				return o.class.handles(text, filename);
			});
		}
	};
});

var JsonTranslator = {
	handles: function(data) {
		return true;
	},

	extensions: [ 'json' ],

	toStory: function(data) {
		var json = angular.fromJson(data);
		return new Story(json);
	},

	fromStory: function(story) {
		return story.serialize(true);
	}
};

var TwineTranslator = {
	handles: function(data) {
		return data.indexOf('::') == 0;
	},

	extensions: [ 'txt' ],

	toStory: function(data) {
		var lines = data.split('\n');
		var line = '';

		// reg ex identifiers
		var reId = /:: (.+) (\[.+\])?$/;
		var reChoice = /\[\[(.+)\|(.+)\]\]$/;

		// Looks through the content of the passage for choices
		function fixPassage(passage) {
			var contents = passage.content.split('\n');
			var content = null;
			passage.content = '';
			while (content = contents.shift()) {
				var match = reChoice.exec(content);
				if (match) {
					passage.add_choice(parseChoice(match));
				}
				else {
					passage.content += content;
				}
			}
		};

		function parseChoice(match) {
			var choice = new Choice();
			choice.content = match[1];
			choice.destination = match[2];
			return choice;
		};

		var story = new Story();
		var passage = null;
		while (line = lines.shift()) {
			line = line.trim();
			var id = reId.exec(line);
			if (id) {
				switch (id[1]) {
					case('StoryAuthor'):
						story.author = lines.shift();
						break;
					case('StoryTitle'):
						story.title = lines.shift();
						break;
					default: // Parse the text!
						var passage = new Passage();
						var content = '';
						passage.id = id[1];
						if (id[2]) passage.tags = ids[2];
						while (content = lines.shift()) {
							if (reId.test(content)) {
								lines.unshift(content);
								break;
							}
							passage.content += content;
						}
						fixPassage(passage);
						story.add_passage(passage);
				}
				continue;
			}
		}
	},

	fromStory: function(story) {
		throw new Error('not implemented');
	}
};


var BinaryTranslator = {
	handles: function(data) {

	},

	extensions: [ 'tron' ],

	toStory: function(data) {

	},

	fromStory: function(story) {
		// TODO: Convert story to binary here either directly via story object or via story.serialize() JSON

		// Create a binary unsigned byte view of 100 bytes.
		var buffer = new ArrayBuffer(100),
			byteView = new Uint8Array(buffer),
			uint16View = new Uint16Array(buffer),
			uint32View = new Uint32Array(buffer);

		// Set a few example byte values
		/*byteView[0] = 0;
		byteView[1] = 255;
		byteView[2] = 0xff;
		byteView[3] = 1;
		byteView[4] = 0x01;

		uint32View[2] = 0xffffffff;
		uint32View[3] = 0x01010101;
		uint32View[4] = 6000000;*/

		for (var i=0; i<uint32View.length; i++) {
			uint32View[i] = i*2;
		}

		for (var i=0; i<uint16View.length; i++) {
			console.log("Entry " + i + ": " + uint16View[i]);
			uint16View[i] = i;
		}

		return buffer;
	}
};

var InkleTranslator = {
	handles: function(data) {

	},

	extensions: [ 'json' ],

	toStory: function(data) {

	},

	fromStory: function(story) {

	}
};

})();
