angular.module('storyApp.models')
.factory('Playback', ['Model', 
function(Model) {

	function Playback(data) {
		this.story = null;

		// Holds all of the data being manipulated during playback
		this.sandbox = {};

		// Stores the array of choice ids selected, in order
		this.selected = [];

		Model.call(this, data);
	};

	Playback.methods = {
		start: function(story) {
			this.story = story;
			var opening = story && story.get_opening();
			this.trim(opening);
			return opening;
		},

		trim: function(passage) {
			if (!passage || !passage.choices) {
				return;
			}
			var self = this;
			passage.choices.forEach(function(c) {
				c.hidden = c.condition && !c.condition.empty() && !c.condition.test(self.sandbox);
			});
		},

		select: function(choice) {
			var choice = choice && choice.id ? this.story.get_choice(choice.id) : choice;
			if (!choice) {
				return null;
			}

			var self = this;
			this.selected.push(choice.id);
			if (choice.updates.forEach) {
				choice.updates.forEach(function(u) {
					u.apply(self.sandbox);
				});
			}

			if (!choice.has_destination()) {
				return null;
			}

			var next = this.story.get_passage(choice.destination);
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
	Model.extend(Playback, Playback.methods);

	return Playback;
}
]);
