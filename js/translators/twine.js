angular.module('storyApp.translators')
.service('TwineTranslator', ['Story', 'Passage', 'Choice', 
function(Story, Passage, Choice) {
	return {
		type: 'twee',
		name: 'Twine',

		importMenuTitle: 'Import from Twine',
		imports: [ 'txt', 'twee' ],
		import: function(data) {
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

		exportMenuTitle: 'Export to Twine Format',
		exports: 'twee',
		export: function(story) {
			throw new Error('not implemented');
		}
	};
}]);
