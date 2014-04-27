angular.module('storyApp.models')
.factory('Playback', ['Model', 
function(Model) {

	function Playback(data) {
		this.story = null;

		// Holds all of the data being manipulated during playback
		this.sandbox = {};

		// Stores the array of choice ids selected, in order
		this.choices = [];

		Model.call(this, data);
	};

	Playback.methods = {
		start: function(story) {
			this.story = story;
			return story && story.get_opening();
		},

		select: function(choice) {
			var choice = choice && choice.id ? this.story.get_choice(choice.id) : choice;
			if (!choice) {
				return null;
			}

			var self = this;
			this.choices.push(choice.id);
			if (choice.updates.forEach) {
				choice.updates.forEach(function(u) {
					u.apply(self.sandbox);
				});
			}

			if (!choice.has_destination()) {
				return null;
			}

			var next = this.story.get_passage(choice.destination);
			// Trim the unavailable choices
			next.choices = next.choices.forEach(function(c) {
				c.hidden = c.condition && !c.condition.empty() && !c.condition.test(self.sandbox);
			});

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
