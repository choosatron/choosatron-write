angular.module('storyApp.translators')
.service('choosatronTranslator', [
'Story', 'Passage', 'Choice',
function(Story, Passage, Choice) {
	return {
		type: 'bin',
		name: 'Choosatron File',
		datatype: 'application/octet-stream',

		importMenuTitle: 'Import from Choosatron File',
		imports: [ 'dam' ],
		import: function(data) {

		},

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
