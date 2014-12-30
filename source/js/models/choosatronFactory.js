angular.module('storyApp.models')
.factory('Choosatron', ['Model',
function(Model) {

	function Choosatron(data) {
		this.created  = Date.now();
		this.modified   =  Date.now();
		// User friendly name of the Choosatron
		this.name = '';
		// Profile username of the owner
		this.ownerName = '';
		// Spark Cloud username of the owner (if known)
		this.ownerSparkName = '';
		// Unique ID of the Spark Core in the Choosatron
		this.coreId = '';
		// Communicated with the device at least once, verify it exists
		this.verified = false;
		// Registered in the Spark Cloud
		this.isClaimed = false;
		this.claimedOn = null;
		// Is currently reachable from the Spark Cloud
		this.isOnline = false;
		this.lastOnline = null;
		// Is currently connected via USB
		this.isWired = false;
		this.lastWired = null;

		Model.call(this, data);
	}

	Choosatron.methods = {
		getName: function () {
			return this.name || "John Doetron (Give me a fun name!)";
		},

		getOwnerName: function () {
			return this.ownerName || "Unknown";
		},

		getOwnerSparkName: function () {
			return this.ownerSparkName || "Unknown";
		},

		getCoreId: function () {
			return this.coreId;
		},

		isClaimed: function () {
			return this.isClaimed;
		},

		isOnline: function () {
			return this.isOnline;
		},

		isWired: function () {
			return this.isWired;
		}

	}

	Model.extend(Choosatron, Choosatron.methods);

	return Choosatron;
}
]);