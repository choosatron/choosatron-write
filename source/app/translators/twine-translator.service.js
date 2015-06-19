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
			function parseChoices(aPassage, aTweeLines) {
				if (aTweeLines.length === 0) {
					return;
				}

				var content = null;
				aPassage.content = '';

				var hasChoices = false;
				for (var i = 0; i < aTweeLines.length; i++) {
					if (reChoice.test(aTweeLines[i].trim())) {
						hasChoices = true;
						var contentLines = aTweeLines.slice(0, i);
						// Remove all blank lines AFTER the final line of content,
						// but BEFORE the first choice.
						for (var j = contentLines.length - 1; j >= 0; j--) {
							if ((contentLines[j] === '\r') ||
							    (contentLines[j] === '\n') ||
								(contentLines[j].length === 0)) {
								contentLines.pop();
							} else {
								break;
							}
						}

						aPassage.content = contentLines.join('\n');
						aTweeLines = aTweeLines.slice(i);
						break;
					}
				}

				if (hasChoices === false) {
					aPassage.content = aTweeLines.join('\n');
					aTweeLines = [];
				}

				// Cleanup any trailing newline or carriage return.
				if ((aPassage.content[aPassage.content.length - 1] === '\r') ||
					(aPassage.content[aPassage.content.length - 1] === '\n')) {
					aPassage.content = aPassage.content.slice(0, -1);
				}

				// Parse remaining choice lines.
				while (aTweeLines.length) {
					content = aTweeLines.shift().trim();
					var match = reChoice.exec(content);
					if (match) {
						var choice = makeChoice(match[1]);
						aPassage.addChoice(choice);
					} else {
						console.log("Ignoring non-choice line: " + content);
					}
				}

				if (aPassage.choices.length === 0) {
					aPassage.exitType = CDAM.Strings.kExitTypeEnding;
					// Translate the ending quality.
					if (typeof aPassage.tags.eq != 'undefined') {
						aPassage.setEndingIndex(passage.tags.eq - 1);
					} else {
						aPassage.setEndingIndex(2);
					}
				} else if (aPassage.choices.length === 1) {
					if (aPassage.choices[0].content == '<append>') {
						aPassage.exitType = CDAM.Strings.kExitTypeAppend;
						aPassage.appendLink = aPassage.choices[0];
					} else if (aPassage.choices[0].content == '<continue>') {
						aPassage.exitType = CDAM.Strings.kExitTypeChoices;
						aPassage.choices[0].content = 'Continue...';
					}
				}
			}

			var story = new Story();
			var passage = null;
			while (tweePassages.length) {
				tweeLines = tweePassages.shift().trim().split('\n');
				var tweeTitle = tweeLines.shift().trim();

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
							//console.log("Start Passage Found!");
							passage.isStart = true;
						}

						if (typeof id[2] === 'undefined') {
							//console.log("No tags for passage: " + passage.id);
						} else {
							var tagItems = [];
							var cur, pair;
							tagItems = id[2].split(' ');
							for (var i = 0; i < tagItems.length; i++) {
								pair = tagItems[i].split(':');
								if (pair.length === 2) {
									passage.tags[pair[0]] = pair[1];
								}
							}
						}
						// Parse and create choices.
						parseChoices(passage, tweeLines);
						// Add the passage.
						story.addPassage(passage);
				}
			}
			story.generatePsgEntrances();

			return story;
		},

		exportMenuTitle: 'Export to Twine Format',
		//exports: 'twee',
		export: function(story) {
			throw new Error('not implemented');
		}
	};
}]);
