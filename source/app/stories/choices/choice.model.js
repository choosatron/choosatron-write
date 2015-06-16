angular.module('storyApp.models')
.factory('Choice', ['BaseModel', 'Command',
function(BaseModel, Command) {
	/// Choice ///
	function Choice(data) {
		this.content = '';

		// Used to determine whether conditions are shown in the UI
		this.showCondition = false;

		// Used to determine whether updates are shown in the UI
		this.showUpdates = false;

		// These are the conditions used to determine whether this choice is displayed
		this.condition = null;

		// The id of the passage that this choice links to
		this.destination = '';

		// The updates to perform when this choice is selected
		this.updates = [];

		BaseModel.call(this, data);
	}

	Choice.methods = {
		getContent: function () {
			return this.content || "Unwritten Choice";
		},

		hasDestination: function(aId) {
			if ('undefined' == typeof aId) {
				return this.destination;
			}
			return aId == this.destination;
		},

		setDestination: function(aId) {
			this.destination = aId;
		},

		removeDestination: function() {
			this.destination = null;
		},

		addUpdate: function(aUpdate) {
			this.updates.push(new Command(aUpdate));
		},

		loadUpdates: function(aUpdates) {
			this.updates = [];
			for (var i = 0; i < aUpdates.length; i++) {
				var update = new Command(aUpdates[i]);
				this.updates.push(update);
			}
			this.showUpdates = this.updates.length > 0;
		},

		loadCondition: function(aCondition) {
			if (aCondition !== null) {
				console.log("Condition: ");
				console.log(aCondition);
				console.log("done");
				this.condition = new Command(aCondition);
				this.showCondition = aCondition && aCondition.length;
			}
		}
	};
	BaseModel.extend(Choice, Choice.methods);

	return Choice;
}
]);
