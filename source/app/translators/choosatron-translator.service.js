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

	var ENDIAN = true; // true for little-endian, false for big-endian
	var SOH    = 0x01;
	var ETX    = 0x03;

	var PSG_FLAG_APPEND_INDEX = 7; // 0x80;

	/*function ChoosatronStoryVersion(aVersion) {
		var parts = aVersion ? aVersion.toString().split('.') : [];
		this.major = parts.length > 0 ? parts[0] : 0;
		this.minor = parts.length > 1 ? parts[1] : 0;
		this.revision = parts.length > 2 ? parts[2] : 0;
	}*/


	// The header is always 414 bytes
	//
	// Properties on this object are defined dynamically to
	// allow writing directly to the underlying ArrayBuffer
	// when set.
	function ChoosatronStoryHeader(aStory) {
		this.size   = 414;
		this.buffer = new ArrayBuffer(this.size);
		this.view   = new DataView(this.buffer);
		var self    = this;

		function intProp(aOffset, aName, aSetter) {
			Object.defineProperty(self, aName, {
				configurable: true,
				set: function(value) {
					aSetter.call(self.view, aOffset, value, ENDIAN);
				}
			});
		}

		function int8Prop(aOffset, aName) {
			intProp(aOffset, aName, self.view.setInt8);
		}

		function int16Prop(aOffset, aName) {
			intProp(aOffset, aName, self.view.setInt16);
		}

		function int32Prop(aOffset, aName) {
			intProp(aOffset, aName, self.view.setInt32);
		}

		function stringProp(aOffset, aLen, aName) {
			Object.defineProperty(self, aName, {
				configurable: true,
				set: function(aStr) {
					for (var i = 0; i < aLen; i++) {
						if (aStr.length > i) {
							self.view.setInt8(i + aOffset, aStr.charCodeAt(i));
						}
						else {
							self.view.setInt8(i + aOffset, 0);
						}
					}
				}
			});
		}

		int8Prop(0, 'populated');

		// Here is the start of the property definitions
		int8Prop(1, 'binaryVersionMajor');
		int8Prop(2, 'binaryVersionMinor');
		int8Prop(3, 'binaryVersionRevision');

		stringProp(4, 36, 'uuid');

		int8Prop(40, 'features');
		int8Prop(41, 'toggles');
		int8Prop(42, 'flags3');
		int8Prop(43, 'flags4');

		this.storySizeIndex = 44;
		int32Prop(this.storySizeIndex, 'storySize');

		int8Prop(48, 'storyVersionMajor');
		int8Prop(49, 'storyVersionMinor');
		int8Prop(50, 'storyVersionRevision');

		int8Prop(51, 'rsvd');

		stringProp(52, 4, 'lang');
		stringProp(56, 64, 'title');
		stringProp(120, 32, 'subtitle');
		stringProp(152, 48, 'author');
		stringProp(200, 80, 'credits');
		stringProp(280, 128, 'contact');

		this.publishedIndex = 408;
		int32Prop(this.publishedIndex, 'published');
		int16Prop(412, 'variableCount');

		if (aStory) {
			this.populate(aStory);
		}
	}


	ChoosatronStoryHeader.prototype.populate = function(aStory) {
		this.populated = SOH;

		this.binaryVersionMajor = 0;
		this.binaryVersionMinor = 1;
		this.binaryVersionRevision = 0;

		this.uuid = Random.uuid();

		this.features = 0;
		this.toggles = 0;
		this.flags3 = 0;
		this.flags4 = 0;

		//var version = new ChoosatronStoryVersion(aStory.getVersionStr());
		this.storyVersionMajor = aStory.version().major;
		this.storyVersionMinor = aStory.version().minor;
		this.storyVersionRevision = aStory.version().revision;

		this.rsvd = 0;
		this.lang = '';
		this.title = aStory.title();
		this.subtitle = aStory.subtitle();
		this.author = aStory.author();
		this.credits = aStory.credits();
		this.contact = aStory.contact();

		aStory.published(new Date());
		this.published = aStory.published().getTime() / 1000;
	};


	function ChoosatronStoryOperation(aType, aValue1, aValue2) {
		this.type   = aType;
		this.value1 = aValue1;
		this.value2 = aValue2;
	}


	// Writes an operation to a DataView and returns the # bytes written
	ChoosatronStoryOperation.prototype.writeToView = function(aOffset, aView) {
		aView.setInt8(aOffset, this.type);
		aView.setInt16(offset + 1, this.value1, ENDIAN);
		aView.setInt16(offset + 3, this.value2, ENDIAN);
		return 4;
	};


	function ChoosatronStoryChoice() {
		this.attributes = 0;
		this.conditionOperations = [];
		this.updateOperations = [];
		this.body = '';
		this.passageIndex = 0;
	}


	ChoosatronStoryChoice.prototype.populate = function(aChoice, aKeys) {
		this.body = aChoice.content();
		if (aChoice.destination()) {
			for (var i = 0; i < aKeys.length; i++) {
				if (aKeys[i] == aChoice.destination()) {
					this.passageIndex = i;
					break;
				}
			}
		}
	};


	// Writes a choice to a DataView and returns the # bytes written
	ChoosatronStoryChoice.prototype.writeToView = function(aStartingOffset, aView) {
		var offset = aStartingOffset;
		var i, written;

		aView.setInt8(offset, this.attributes);
		offset += 1;

		// Conditions
		aView.setInt8(offset, this.conditionOperations.length);
		offset += 1;
		for (i = 0; i < this.conditionOperations.length; i++) {
			written = this.conditionOperations[i].writeToView(offset, aView);
			offset += written;
		}


		// Operations
		// Delay writing the 2B operation length
		var updateOperationsLengthOffset = offset;
		var updateOperationsLength = 0;
		offset += 2;

		aView.setInt8(offset, this.updateOperations.length);
		offset += 1;
		for (i = 0; i < this.updateOperations.length; i++) {
			written = this.updateOperations[i].writeToView(offset, aView);
			offset += written;
			updateOperationsLength += written;
		}
		aView.setInt16(updateOperationsLengthOffset, updateOperationsLength, ENDIAN);


		// Set the choice body size
		aView.setInt16(offset, this.body.length, ENDIAN);
		offset += 2;
		for (i = 0; i < this.body.length; i++) {
			aView.setInt8(offset, this.body.charCodeAt(i));
			offset += 1;
		}

		aView.setInt16(offset, this.passageIndex, ENDIAN);
		offset += 2;

		return offset - aStartingOffset;
	};


	function ChoosatronStoryPassage() {
		this.attributes = 0;
		this.updateOperations = [];
		this.choices = [];
		this.body = '';
		this.endingValue = false;
	}


	ChoosatronStoryPassage.prototype.populate = function(aPassage, aKeys) {
		this.body = aPassage.content;

		var choice;

		if (aPassage.hasAppend()) {
			// Set the append flag at the proper index.
			this.attributes |= 1 << PSG_FLAG_APPEND_INDEX;
			// Append link isn't in the list of choices, so we need to add it here.
			choice = new ChoosatronStoryChoice();
			choice.populate(aPassage.getChoiceAtIndex(0), aKeys);
			this.choices.push(choice);
		} else if (aPassage.hasEnding()) {
			this.endingValue = CDAM.Config.kEndingTags.values[aPassage.endingIndex()] || 3;
		} else if (aPassage.hasChoices()) {
			for (var i = 0; i < aPassage.choices().length; i++) {
				choice = new ChoosatronStoryChoice();
				choice.populate(aPassage.getChoiceAtIndex(i), aKeys);
				this.choices.push(choice);
			}
		}
	};


	ChoosatronStoryPassage.prototype.writeToView = function(aStartingOffset, aView) {
		var offset = aStartingOffset;
		var i, written;

		// Attributes
		aView.setInt8(offset, this.attributes);
		offset += 1;

		// UpdateOperations
		aView.setInt8(offset, this.updateOperations.length);
		offset += 1;
		for (i = 0; i < this.updateOperations.length; i++) {
			written = this.updateOperations[i].writeToView(offset, aView);
			offset += written;
		}

		// Body
		aView.setInt16(offset, this.body.length, ENDIAN);
		offset += 2;
		for (i = 0; i < this.body.length; i++) {
			aView.setInt8(offset, this.body.charCodeAt(i));
			offset += 1;
		}

		// Choices
		aView.setInt8(offset, this.choices.length);
		offset += 1;
		for (i = 0; i < this.choices.length; i++) {
			written = this.choices[i].writeToView(offset, aView);
			offset += written;
		}

		if (this.endingValue !== false) {
			aView.setInt8(offset, this.endingValue);
			offset += 1;
		}

		aView.setInt8(offset, ETX);
		offset += 1;

		return offset - aStartingOffset;
	};


	function ChoosatronStoryBody(aStory) {
		this.passages = [];
		if (aStory) {
			this.populate(aStory);
		}
	}

	ChoosatronStoryBody.prototype.populate = function(aStory) {
		var keys = Object.keys(aStory.passages());
		for (var i = 0; i < keys.length; i++) {
			var passage = new ChoosatronStoryPassage();
			passage.populate(aStory.getPassage(keys[i]), keys);
			this.passages.push(passage);
		}
	};

	ChoosatronStoryBody.prototype.writeToView = function(aStartingOffset, aView) {
		var offset = aStartingOffset;
		var passageOffsets = [];
		var passageOffset = 0; // passage offset is relative
		var size = 0;

		var i, written;

		offset += 2 + (4 * this.passages.length); // Offset start after PassageOffsets
		for (i = 0; i < this.passages.length; i++) {
			written = this.passages[i].writeToView(offset, aView);
			passageOffsets.push(passageOffset);
			passageOffset += written;
			offset += written;
		}

		// The final size of the body
		size = offset - aStartingOffset;

		// Rewind to write the passage offsets
		offset = aStartingOffset;
		aView.setInt16(offset, this.passages.length, ENDIAN); // PassageCount
		offset += 2;
		for (i = 0; i < passageOffsets.length; i++) {
			aView.setInt32(offset, passageOffsets[i], ENDIAN);
			offset += 4;
		}

		return size;
	};


	function ChoosatronStoryFile(aStory) {
		this.header = new ChoosatronStoryHeader(aStory);
		this.body   = new ChoosatronStoryBody(aStory);
	}

	ChoosatronStoryFile.prototype.generateArrayBuffer = function() {
		// Start with the buffer used for the head
		var builder = ArrayBufferFactory.Builder(this.header.buffer);

		// Write out the body so we can determine the overall size
		var bodySize = this.body.writeToView(this.header.size, builder);
		var fullSize = bodySize + this.header.size;

		builder.setInt32(this.header.storySizeIndex, fullSize, ENDIAN);
		return builder.trim(fullSize);
	};


	return {
		type: 'bin',
		name: 'Choosatron File',
		datatype: 'application/octet-stream',

		exportMenuTitle: 'Create a Choosatron File',
		exports: 'dam',
		export: function(aStory) {
			var file = new ChoosatronStoryFile(aStory);
			var buffer = file.generateArrayBuffer();
			return buffer;
		}
	};
}]);
