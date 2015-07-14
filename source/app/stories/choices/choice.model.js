angular.module('storyApp.models')
.factory('Choice', ['BaseModel', 'Command',
function(BaseModel, Command) {
	/// Choice ///
	function Choice(aData) {
		if (!aData) {
			this.data.created = Date.now();
		}

		/* Non Serialized */

		// Used to determine whether conditions are shown in the UI
		this.showCondition = false;

		// Used to determine whether updates are shown in the UI
		this.showUpdates = false;

		/* Serialized */

		this.data.content = '';

		// These are the conditions used to determine whether this choice is displayed
		this.data.condition = null;

		// The updates to perform when this choice is selected
		this.data.updates = [];

		// The id of the passage that this choice links to
		this.data.destination = '';

		BaseModel.call(this, aData);
	}

	Choice.methods = {

		loadUpdates: function(aUpdates) {
			this.data.updates = [];
			for (var i = 0; i < aUpdates.length; i++) {
				var update = new Command(aUpdates[i]);
				this.data.updates.push(update);
			}
			this.showUpdates = this.updates.data.length > 0;
		},

		loadCondition: function(aCondition) {
			if (aCondition !== null) {
				console.log("Condition: ");
				console.log(aCondition);
				console.log("done");
				this.data.condition = new Command(aCondition);
				this.showCondition = aCondition && aCondition.length;
			}
		},

		/* Getters / Setters */

		// Non Serialized //

		showCondition: function() {
			return this.data.showCondition;
		},

		setShowCondition: function(aValue) {
			this.data.showCondition = aValue;
		},

		showUpdates: function() {
			return this.data.showUpdates;
		},

		setShowUpdates: function(aValue) {
			this.data.showUpdates = aValue;
		},

		// Serialized //

		getContent: function() {
			return this.data.content || "Unwritten Choice";
		},

		setContent: function(aValue) {
			this.data.content = aValue;
		},

		getCondition: function() {
			return this.data.condition;
		},

		setCondition: function(aValue) {
			this.data.condition = aValue;
		},

		getUpdates: function() {
			return this.data.updates;
		},

		setUpdates: function(aValue) {
			this.data.updates = aValue;
		},

		addUpdate: function(aValue) {
			this.data.updates.push(aValue);
		},

		removeUpdate: function(aValue) {
			for (var i = 0; i < this.data.updates.length; i++) {
				if (aValue.getId() === this.data.updates[i]) {
					this.data.updates.splice(i, 1);
					return;
				}
			}
		},

		hasDestination: function(aId) {
			if (typeof aId === 'undefined') {
				return this.data.destination;
			}
			return aId == this.data.destination;
		},

		getDestination: function(aValue) {
			return this.data.destination;
		},

		setDestination: function(aValue) {
			if (!aValue) {
				aValue = null;
			}
			this.data.destination = aValue;
		}

	};
	BaseModel.extend(Choice, Choice.methods);

	return Choice;
}
]);
