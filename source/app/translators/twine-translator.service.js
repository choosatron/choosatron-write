angular.module('storyApp.translators')
.service('twineTranslator', ['Story', 'Passage', 'Choice',
function(Story, Passage, Choice) {
	return {
		type: 'twee',
		name: 'Twine',

		importMenuTitle: 'Import from Twine',
		imports: [ 'txt', 'twee', 'tw' ],
		import: function(data) {
			var tweePassages = data.split(/(?=:: )/);
			var tweeLines = [];

			// reg ex identifiers
			// Match two items from the ID, the name of the passage, and the clump of tags.
			var reId = /::\s+([^\[\s]+(?:\s+[^\[\s]+)*)(?:\s*\[([\S]+\:[\S]+(?:[\s][\S]+\:[\S]+)*)\])?/;
			//var reId = /:: (.+)/;
			//var reAttributes = /\s(\[([^\]\[]+)\])\s/;
			var reChoice = /^\[\[(.+)\]\]/;

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
				console.log("Choice content: " + choice.content);
				console.log("Choice dest: " + choice.destination);
				return choice;
			}

			// Looks through the content of the passage for choices
			function parseChoices(aPassage, aTweeLines) {
				if (aTweeLines.length === 0) {
					return;
				}
				//var contents = passage.content.split('\n');
				var content = null;

				aPassage.content = '';

				var hasChoices = false;
				for (var i = 0; i < aTweeLines.length; i++) {
					if (reChoice.test(aTweeLines[i].trim())) {
						hasChoices = true;
						aPassage.content = aTweeLines.slice(0, i - 1).join('\n');
						aTweeLines = aTweeLines.slice(i);
						break;
					}
				}

				if (hasChoices === false) {
					aPassage.content = aTweeLines.join('\n');
					aTweeLines = [];
				}

				// Cycle through content lines until we hit a choice (which must be on it's own line).
				/*while (aTweeLines.length) {
					if (reChoice.test(aTweeLines[0])) {
						break;
					} else {
						aPassage.content += aTweeLines.shift();
					}
				}*/
				console.log("Content: " + aPassage.content);

				// Parse remaining choice lines.
				while (aTweeLines.length) {
					content = aTweeLines.shift().trim();
					var match = reChoice.exec(content);
					console.log(content);
					if (match) {
						console.log("Is choice: " + match[1]);
						var choice = makeChoice(match[1]);
						aPassage.addChoice(choice);
					} else {
						console.log("Ignoring non-choice line: " + content);
					}
				}

				if (aPassage.choices.length === 0) {
					aPassage.exitType = 'ending';
					// Translate the ending quality.
					if (typeof aPassage.tags.eq != 'undefined') {
						aPassage.setEnding(passage.tags.eq - 3);
					} else {
						aPassage.setEnding(0);
					}
					console.log("Ending Val: " + aPassage.endingValue);
				} else if (aPassage.choices.length === 1) {
					console.log(aPassage.choices[0].content);
					console.log(aPassage.choices[0]);
					if (aPassage.choices[0].content == '<append>') {
						aPassage.exitType = 'append';
						aPassage.appendLink = aPassage.choices[0];
						console.log("Appended");
					} else if (aPassage.choices[0].content == '<continue>') {
						aPassage.exitType = 'choices';
						aPassage.choices[0].content = 'Continue...';
						console.log("Continue");
					}
				}
			}

			var story = new Story();
			var passage = null;
			while (tweePassages.length) {
				tweeLines = tweePassages.shift().trim().split('\n');

				var tweeTitle = tweeLines.shift().trim();
				/*while (reId.test(line) === false) {
					line = lines.shift().trim();
					console.log(line);
				}*/

				var id = reId.exec(tweeTitle);
				if (!id) continue;
				switch (id[1].trim()) {
					case('StoryAuthor'):
						story.author = tweeLines.join('');
						//console.log("Author: " + story.author);
						break;
					case('StoryTitle'):
						story.title = tweeLines.join('');
						//console.log("Title: " + story.title);
						break;
					case('StorySubtitle'):
						story.subtitle = tweeLines.join('');
						//console.log("Subtitle: " + story.subtitle);
						break;
					default: // Parse the text!
						passage = new Passage();
						var content = '';
						//var attrs = reAttributes.exec(id);
						passage.id = id[1].trim();

						if (passage.id === 'Start') {
							passage.opening = true;
						}

						if (typeof id[2] === 'undefined') {
							console.log("No tags for passage: " + passage.id);
						} else {
							//console.log(id[2]);
							var tagItems = [];
							var cur, pair;
							tagItems = id[2].split(' ');
							console.log(tagItems);
							for (var i = 0; i < tagItems.length; i++) {
								pair = tagItems[i].split(':');
								console.log("Items: " + pair);
								if (pair.length === 2) {
									passage.tags[pair[0]] = pair[1];
								}
								//console.log("Tag: " + pair[0] + ", Val: " + pair[1]);
							}
						}

						//if (attrs) passage.tags = attrs[1];

						/*while (lines.length) {
							content = lines.shift().trim();
							if (reId.test(content)) {
								lines.unshift(content);
								break;
							}
							passage.content += content + '\n';
						}*/
						parseChoices(passage, tweeLines);
						// Add the passage.
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
