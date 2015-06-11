angular.module('storyApp.translators')
.service('twineTranslator', ['Story', 'Passage', 'Choice',
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
			// Match two items from the ID, the name of the passage, and all tags if any.
			var reId = /::\s+(\S+)(?:\s+\[([\S]+\:[\S]+(?:[\s][\S]+\:[\S]+)*)\])?/;
			//var reId = /:: (.+)/;
			//var reAttributes = /\s(\[([^\]\[]+)\])\s/;
			var reChoice = /\[\[(.+)\]\]/;

			console.log('Twine import:');

			function makeChoice(str) {
				var pipe = str.indexOf('|');
				var choice = new Choice();
				if (pipe < 0) {
					choice.content = str;
					choice.destination = str;
					return choice;
				}
				choice.content = str.substr(0, pipe);
				choice.destination = str.substr(pipe + 1);
				return choice;
			}

			// Looks through the content of the passage for choices
			function parseChoices(passage) {
				if (!passage.content) {
					return;
				}
				var contents = passage.content.split('\n');
				var content = null;
				passage.content = '';
				while (contents.length) {
					content = contents.shift();
					var match = reChoice.exec(content);
					if (match) {
						var choice = makeChoice(match[1]);
						passage.addChoice(choice);
					}
					else {
						passage.content += content;
					}
				}

				if (passage.choices.length === 0) {
					passage.exitType = 'ending';
					// Translate the ending quality.
					if (typeof passage.tags.eq != 'undefined') {
						passage.setEnding(passage.tags.eq - 3);
					} else {
						passage.setEnding(0);
					}
					console.log("Ending Val: " + passage.endingValue);
				} else if (passage.choices.length === 1) {
					console.log(passage.choices[0].content);
					console.log(passage.choices[0]);
					if (passage.choices[0].content == '<append>') {
						passage.exitType = 'append';
						passage.appendLink = passage.choices[0];
						console.log("Appended");
					} else if (passage.choices[0].content == '<continue>') {
						passage.exitType = 'choices';
						passage.choices[0].setContent = 'Continue...';
						console.log("Continue");
					}
				}
			}

			var story = new Story();
			var passage = null;
			while (lines.length) {
				line = lines.shift().trim();
				//if (!line.length) continue;
				while (reId.test(line) === false) {
					line = lines.shift().trim();
					console.log(line);
				}

				var id = reId.exec(line);
				console.log("Id: " + id[1]);
				if (!id) continue;
				switch (id[1].trim()) {
					case('StoryAuthor'):
						story.author = lines.shift();
						console.log("Author: " + story.author);
						break;
					case('StoryTitle'):
						story.title = lines.shift();
						console.log("Title: " + story.title);
						break;
					case('StorySubtitle'):
						story.subtitle = lines.shift();
						console.log("Subtitle: " + story.subtitle);
						break;
					default: // Parse the text!
						passage = new Passage();
						var content = '';
						//var attrs = reAttributes.exec(id);
						passage.id = id[1];

						if (typeof id[2] === 'undefined') {
							console.log("No tags for passage: " + passage.id);
						} else {
							console.log(id[2]);
							var tagItems = [];
							var cur, pair;
							tagItems = id[2].split(' ');
							for (var i = 0; i < tagItems.length; i++) {
								pair = tagItems[i].split(':');
								passage.tags[pair[0]] = pair[1];
								//console.log("Tag: " + pair[0] + ", Val: " + pair[1]);
							}
						}

						//if (attrs) passage.tags = attrs[1];

						while (lines.length) {
							content = lines.shift().trim();
							if (reId.test(content)) {
								lines.unshift(content);
								break;
							}
							passage.content += content + '\n';
						}
						parseChoices(passage);
						story.addPassage(passage);
				}
			}

			return story;
		},

		exportMenuTitle: 'Export to Twine Format',
		//exports: 'twee',
		export: function(story) {
			throw new Error('not implemented');
		}
	};
}]);
