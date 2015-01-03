angular.module('storyApp.models')
.factory('Choosatron', ['BAseModel',
function(BaseModel) {

	function Choosatron(data) {
		this.created  = Date.now();
		this.modified   =  Date.now();
		// User friendly name of the Choosatron
		this.friendlyName = '';
		// Profile username of the owner
		this.ownerName = '';
		// Spark Cloud username of the owner (if known)
		this.ownerSparkUser = '';
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

		// Other local accounts can use this Choosatron.
		this.shareLocally = false;
		this.localAccessToken = '';

		BaseModel.call(this, data);
	}

	Choosatron.methods = {

		getName: function () {
			return this.friendlyName || "John Doetron (Give me a fun name!)";
		},

		setName: function (item) {
			console.log("Set name: " + item);
			this.name = item;
		},

		getOwnerName: function () {
			return this.ownerName || "Unknown";
		},

		getOwnerSparkName: function () {
			return this.ownerSparkName || "Unknown";
		},

		getCoreId: function () {
			return this.coreId || "Choosatron is not verified.";
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

	BaseModel.extend(Choosatron, Choosatron.methods);

	return Choosatron;
}
]);