/*
 * Binary format for Choosatron
 *
 * All littlendian numbers
 *
 * Loop through each passage:
 *   StoryHeader
 *     1 StartHeader
 *     BinaryVersion
 *       1 Major
 *       1 Minor
 *       1 Revision
 *     36 UUID
 *     Flags
 *       1 Feature Used
 *       1 Toggles
 *       1 Flags3
 *       1 Flags4
 *     4 StorySize
 *     StoryVersion
 *       1 Major
 *       1 Minor
 *       1 Revision
 *     1 Rsvd
 *     4 LanguageCode
 *     64 Title
 *     32 Subtitle
 *     48 Author
 *     80 Credits
 *     128 Contact
 *     4 PublishDate
 *     2 VariableCount
 *   StoryBody
 *     PassageCount
 *       (2 bytes: represents # of passages.)
 *     PassageOffset
 *       (repeats PassageCount times, UInt32 - 4 bytes. First PassageOffset is always 0. # of bytes to access passage)
 *     Passage
 *       Attributes (1 byte)
 *       UpdateCount (1 byte)
 *       UpdateOperation
 *       ValueUpdate
 *         VariableTypes
 *         Value/Index1
 *         Value/Index2
 *       BodyLength
 *       Body
 *       ChoiceCount
 *       Choice
 *         Attribute
 *         ConditionCount
 *         ConditionOperation
 *         DisplayCondition
 *           ValueTypes
 *           Value/Index1
 *           Value/Index2
 *         UpdateLength
 *         UpdateCount
 *         UpdateOperation
 *         ValueUpdate
 *           VariableTypes
 *           Value/Index1
 *           Value/Index2
 *         ChoiceLength
 *         ChoiceBody
 *         PassageIndex
 *       Ending
 *       EndBody
 *
 */

angular.module('storyApp.translators')
.service('choosatronTranslator', ['Random', 'ArrayBufferFactory',
function(Random, ArrayBufferFactory) {

	function ChoosatronStoryVersion(version) {
		var parts = version ? version.toString().split('.') : [];
		this.major = parts.length > 0 ? parts[0] : 0;
		this.minor = parts.length > 1 ? parts[1] : 0;
		this.revision = parts.length > 2 ? parts[2] : 0;
	}


	// The header is always 414 bytes
	//
	// Properties on this object are defined dynamically to
	// allow writing directly to the underlying ArrayBuffer
	// when set.
	function ChoosatronStoryHeader(story) {
		this.size = 414;
		this.buffer = new ArrayBuffer(this.size);
		this.view = new DataView(this.buffer);

		var self = this;

		function intProp(offset, name, setter) {
			Object.defineProperty(self, name, {
				configurable: true,
				set: function(value) {
					setter.call(self.view, offset, value);
				}
			});
		}

		function int8Prop(offset, name) {
			intProp(offset, name, self.view.setInt8);
		}

		function int16Prop(offset, name) {
			intProp(offset, name, self.view.setInt16);
		}

		function int32Prop(offset, name) {
			intProp(offset, name, self.view.setInt32);
		}

		function stringProp(offset, name) {
			Object.defineProperty(self, name, {
				configurable: true,
				set: function(str) {
					for (var i=0; i<str.length; i++) {
						self.view.setInt8(i + offset, str.charCodeAt(i));
					}
				}
			});
		}

		// Here is the start of the property definitions
		int8Prop(1, 'binaryVersionMajor');
		int8Prop(2, 'binaryVersionMinor');
		int8Prop(3, 'binaryVersionRevision');

		stringProp(4, 'uuid');

		int8Prop(40, 'features');
		int8Prop(41, 'toggles');
		int8Prop(42, 'flags3');
		int8Prop(43, 'flags4');

		int32Prop(44, 'storySize');

		int8Prop(48, 'storyVersionMajor');
		int8Prop(49, 'storyVersionMinor');
		int8Prop(50, 'storyVersionRevision');

		int8Prop(51, 'rsvd');

		stringProp(52, 'lang');
		stringProp(56, 'title');
		stringProp(120, 'subtitle');
		stringProp(152, 'author');
		stringProp(200, 'credits');
		stringProp(280, 'contact');

		int32Prop(408, 'publishDate');
		int16Prop(412, 'variableCount');

		if (story) {
			this.populate(story);
		}
	}


	ChoosatronStoryHeader.prototype.populate = function(story) {
		// Populate the head
		this.binaryVersionMajor = 0;
		this.binaryVersionMinor = 0;
		this.binaryVersionRevision = 0;

		this.uuid = Random.uuid();

		this.features = 0;
		this.toggles = 0;

		var version = new ChoosatronStoryVersion(story.version);
		this.storyVersionMajor = version.major;
		this.storyVersionMinor = version.minor;
		this.storyVersionRevision = version.revision;

		this.lang = '';
		this.title = story.title;
		this.subtitle = story.description;
		this.author = story.author;
		this.credits = story.credit;
	};


	function ChoosatronStoryOperation(type, value1, value2) {
		this.type   = type;
		this.value1 = value1;
		this.value2 = value2;
	}


	// Writes an operation to a DataView and returns the # bytes written
	ChoosatronStoryOperation.prototype.writeToView = function(offset, view) {
		view.setInt8(offset++, this.type);
		view.setInt16(offset += 2, this.value1);
		view.setInt16(offset += 2, this.value2);
		return 4;
	};


	function ChoosatronStoryChoice() {
		this.attributes = 0;
		this.conditionOperations = [];
		this.updateOperations = [];
		this.body = '';
		this.passageIndex = 0;
	}


	ChoosatronStoryChoice.prototype.populate = function(story, choice) {
		this.body = choice.content;
		if (choice.destination) {
			this.passageIndex = story.getPassageIndex(choice.destination);
		}
	};


	// Writes a choice to a DataView and returns the # bytes written
	ChoosatronStoryChoice.prototype.writeToView = function(startingOffset, view) {
		var offset = startingOffset;
		var i, written;

		view.setInt8(offset++, this.attributes);

		// Conditions
		view.setInt8(offset++, this.conditionOperations.length);
		for (i=0; i<this.conditionOperations.length; i++) {
			written = this.conditionOperations[i].writeToView(offset, view);
			offset += written;
		}

		// Operations
		// Delay writing the operation length
		var updateOperationLengthOffset = offset;
		var updateOperationsSize = 0;
		offset += 2;

		view.setInt8(offset++, this.updateOperations.length);
		for (i=0; i<this.updateOperations.length; i++) {
			written = this.updateOperations[i].writeToView(offset, view);
			offset += written;
			updateOperationsSize += written;
		}

		view.setInt16(updateOperationLengthOffset, this.updateOperations.length);

		var size = (offset - startingOffset) + this.body.length + 2; // Two for the PassageIndex
		view.setInt16(offset += 2, size);

		for (i=0; i<this.body.length; i++) {
			view.setInt8(offset++, this.body.charCodeAt(i));
		}

		view.setInt16(offset += 2, this.passageIndex);

		return size;
	};


	function ChoosatronStoryPassage() {
		this.attributes = 0;
		this.updateOperations = [];
		this.choices = [];
		this.body = '';
	}


	ChoosatronStoryPassage.prototype.populate = function(story, passage) {
		this.body = passage.body;
		if (!passage.choices) {
			return;
		}
		for (var i=0; i<passage.choices.length; i++) {
			var choice = new ChoosatronStoryChoice();
			choice.populate(story, passage.choices[i]);
			this.choices.push(choice);
		}
	};


	ChoosatronStoryPassage.prototype.writeToView = function(startingOffset, view) {
		var offset = startingOffset;
		var i, written;

		view.setInt8(offset++, this.attributes);
		view.setInt8(offset++, this.updateOperations.length);

		for (i=0; i<this.updateOperations.length; i++) {
			written = this.updateOperations.writeToView(offset, view);
			offset += written;
		}

		view.setInt16(offset += 2, this.body.length);
		for (i=0; i<this.body.length; i++) {
			view.setInt8(offset++, this.body.charCodeAt(i));
		}

		view.setInt8(offset++, this.choices.length);
		for (i=0; i<this.choices.length; i++) {
			written = this.choices[i].writeToView(offset, view);
			offset += written;
		}
	};


	function ChoosatronStoryBody(story) {
		this.passages = [];
		if (story) {
			this.populate(story);
		}
	}

	ChoosatronStoryBody.prototype.populate = function(story) {
		if (!story.passages) {
			return;
		}
		for (var i=0; i<story.passages.length; i++) {
			var passage = new ChoosatronStoryPassage();
			passage.populate(story, story.passages[i]);
			this.passages.push(passage);
		}
	};

	ChoosatronStoryBody.prototype.writeToView = function(startingOffset, view) {
		var offset = startingOffset;
		var passageOffsets = [];
		var size = 0;

		var i, written;

		view.setInt16(offset += 2, this.passages.length); // PassageCount
		offset += (2 * this.passages.length); // Offset start after PassageOffsets

		for (i=0; i<this.passages.length; i++) {
			written = this.passages.writeToView(offset, view);
			passageOffsets.push(offset);
			offset += written;
		}

		// The final size of the body
		size = offset;

		// Rewind to write the passage offsets
		offset = startingOffset + 2;
		for (i=0; i<passageOffsets.length; i++) {
			view.setInt16(offset += 2, passageOffsets[i]);
		}

		return size;
	};


	function ChoosatronStoryFile(story) {
		this.header = new ChoosatronStoryHeader(story);
		this.body   = new ChoosatronStoryBody(story);
	}

	ChoosatronStoryFile.prototype.generateArrayBuffer = function() {
		// Start with the buffer used for the head
		var builder = ArrayBufferFactory.Builder(this.header.buffer);

		// Write out the body so we can determine the overall size
		var bodySize = this.body.writeToView(this.header.size, builder);

		// One for the end byte
		this.header.storySize = bodySize + this.header.size + 1;

		// Add the EndBody byte
		builder.setInt8(bodySize + this.header.size, 0x03);
		return builder.trim();
	};


	return {
		type: 'bin',
		name: 'Choosatron File',
		datatype: 'application/octet-stream',

		exportMenuTitle: 'Create a Choosatron File',
		exports: 'dam',
		export: function(story) {
			var file = new ChoosatronStoryFile(story);
			return file.generateArrayBuffer();
		}
	};
}]);
