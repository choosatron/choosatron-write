angular.module('storyApp.translators')
.service('TwineTranslator', ['Story', 'Passage', 'Choice', 
function(Story, Passage, Choice) {
	return {
		type: 'twee',
		name: 'Twine',

		importMenuTitle: 'Import from Twine',
		imports: [ 'txt', 'twee', 'tw' ],
		import: function(data) {
			var lines = data.split('\n');
			var line = '';

			// reg ex identifiers
			var reId = /:: (.+)/;
			var reAttributes = /\s(\[([^\]\[]+)\])\s/;
			var reChoice = /\[\[(.+)\|(.+)\]\]/;

			// Looks through the content of the passage for choices
			function fixPassage(passage) {
				var contents = passage.content.split('\n');
				var content = null;
				passage.content = '';
				while (contents.length) {
					content = contents.shift();
					var match = reChoice.exec(content);
					if (match) {
						var choice = new Choice();
						choice.content = match[1];
						choice.destination = match[2];
						passage.add_choice(choice);
					}
					else {
						passage.content += content;
					}
				}
			};

			var story = new Story();
			var passage = null;
			while (lines.length) {
				line = lines.shift().trim();
				if (!line.length) continue;
				var id = reId.exec(line);
				if (!id) continue;
				switch (id[1].trim()) {
					case('StoryAuthor'):
						story.author = lines.shift();
						break;
					case('StoryTitle'):
						story.title = lines.shift();
						break;
					default: // Parse the text!
						var passage = new Passage();
						var content = '';
						var attrs = reAttributes.exec(id);
						passage.id = id[1].replace(reAttributes, '').trim();
						if (attrs) passage.tags = attrs[1];
						while (lines.length) {
							content = lines.shift().trim();
							if (reId.test(content)) {
								lines.unshift(content);
								break;
							}
							passage.content += content + '\n';
						}
						fixPassage(passage);
						story.add_passage(passage);
				}
			};

			return story;
		},

		exportMenuTitle: 'Export to Twine Format',
		exports: 'twee',
		export: function(story) {
			throw new Error('not implemented');
		}
	};
}]);
