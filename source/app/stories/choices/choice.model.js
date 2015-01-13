angular.module('storyApp.models')
.factory('Choice', ['BaseModel', 'Command',
function(BaseModel, Command) {
	/// Choice ///
	function Choice(data) {
		this.content     =  '';

		// Used to determine whether conditions are shown in the UI
		this.showCondition = false;

		// Used to determine whether updates are shown in the UI
		this.showUpdates = false;

		// These are the conditions used to determine whether this choice is displayed
		this.condition = new Command();

		// The id of the passage that this choice links to
		this.destination = null;

		// The updates to perform when this choice is selected
		this.updates = [];

		BaseModel.call(this, data);
	}

	Choice.methods = {
		getContent: function () {
			return this.content || "Unwritten Choice";
		},

		hasDestination: function(passage) {
			if ('undefined' == typeof passage) {
				return this.destination;
			}
			return passage && passage.id && passage.id == this.destination;
		},

		setDestination: function(passage) {
			this.destination = passage && passage.id;
		},

		addUpdate: function(update) {
			this.updates.push(new Command(update));
		},

		loadUpdates: function(updates) {
			this.updates = [];
			for (var i=0; i<updates.length; i++) {
				var update = new Command(updates[i]);
				this.updates.push(update);
			}
			this.showUpdates = this.updates.length > 0;
		},

		loadCondition: function(condition) {
			this.condition = new Command(condition);
			this.showCondition = condition && condition.length;
		}
	};
	BaseModel.extend(Choice, Choice.methods);

	return Choice;
}
]);
