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
.service('choosatronTranslator', [
'Story', 'Passage', 'Choice', 'Random',
function(Story, Passage, Choice, Random) {

	// The header is always 414 bytes
	//
	// Properties on this object are defined dynamically to
	// allow writing directly to the underlying ArrayBuffer
	// when set.
	function Header() {
		this.buffer = new ArrayBuffer(414);
		this.view = new DataView(this.buffer);

		var self = this;

		function intProp(offset, name, setter) {
			Object.defineProperty(self, name, {
				set: function(value) {
					setter(offset, value);
				}
			});
		}

		function int8Prop(offset, name) {
			intProp(offset, name, self.view.setInt8);
		}

		function int32Prop(offset, name) {
			intProp(offset, name, self.view.setInt32);
		}

		function stringProp(offset, name) {
			Object.defineProperty(self, name, {
				set: function(str) {
					for (var i=0; i<str.length; i++) {
						self.view.setInt8(i + offset, str.charCodeAt(i));
					}
				}
			});
		}

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
		int32Prop(412, 'variableCount');
	};

	return {
		type: 'bin',
		name: 'Choosatron File',
		datatype: 'application/octet-stream',

		exportMenuTitle: 'Create a Choosatron File',
		exports: 'dam',
		export: function(story) {
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

			for (var j=0; j<uint16View.length; j++) {
				console.log("Entry " + j + ": " + uint16View[j]);
				uint16View[j] = j;
			}

			return buffer;
		}
	};
}]);
