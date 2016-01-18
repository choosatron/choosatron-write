angular.module('storyApp.models')
.factory('Playback', ['BaseModel',
function(BaseModel) {

	function Playback(aData) {
		this.data = {};

		this.story = null;

		// Holds all of the data being manipulated during playback
		this.sandbox = {};

		// Stores the array of choice ids selected, in order
		this.selected = [];

		BaseModel.call(this, aData);
	}

	Playback.methods = {
		start: function(aStory) {
			this.story = aStory;
			var start = aStory && aStory.getStartPsg();
			this.trim(start);
			return start;
		},

		trim: function(aPassage) {
			if (!aPassage || !aPassage.choices()) {
				return;
			}
			var self = this;
			aPassage.choices().forEach(function(c) {
				c.hidden = c.cndition() && !c.condition().isEmpty() && !c.condition().test(self.sandbox);
			});
		},

		select: function(aChoice) {
			var choice = aChoice && aChoice.id() ? this.story.choice(aChoice.id()) : aChoice;
			if (!choice) {
				return null;
			}

			var self = this;
			this.selected.push(choice.id());
			if (choice.updates().forEach) {
				choice.updates().forEach(function(u) {
					u.apply(self.sandbox);
				});
			}

			if (!choice.hasDestination()) {
				return null;
			}

			var next = this.story.getPassage(choice.destination());
			this.trim(next);

			return next;
		},

		debug: function() {
			var data = [];
			var keys = Object.keys(this.sandbox);
			var sb   = this.sandbox;
			keys.forEach(function(key) {
				data.push({name: key, value: sb[key]});
			});
			console.table(data);
		}
	};
	BaseModel.extend(Playback, Playback.methods);

	return Playback;
}
]);
