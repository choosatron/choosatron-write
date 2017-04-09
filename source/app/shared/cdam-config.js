(function () {
	"use strict";

	window.CDAM = window.CDAM || {};

	CDAM.Config = {
		kChoosatronEndValMin: 1,
		kChoosatronEndValMax: 5,
		kEndingTags: {
			titles: ['Terrible', 'Bad', 'Neutral', 'Good', 'Great'],
			values: [1, 2, 3, 4, 5],
			css:    ['btn-terrible', 'btn-bad', 'btn-neutral', 'btn-good', 'btn-great']		}
	};
}());