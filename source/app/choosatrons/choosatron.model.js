angular.module('storyApp.models')
.factory('Choosatron', ['BaseModel',
function(BaseModel) {

	function Choosatron(aData) {
		this.data = {};

		/* Non Serialized */
		// Is currently reachable from the Particle Cloud
		this.lastOnline = null; // Need this? or use lastHeard?
		// Is currently connected via USB
		this.isWired = false;
		this.lastWired = null;

		// Serial Path
		this.serialPath = '';

		// Communicated with the device at least once, verify it exists
		//this.data.verified = false;

		// Registered in the Particle Cloud
		//this.data.isClaimed = false;
		//this.data.claimedOn = null;

		/* Serialized */
		// User friendly name of the Choosatron
		this.data.friendlyName = '';
		// Profile username of the owner
		this.data.ownerName = '';
		// Particle Cloud username of the owner (if known)
		this.data.ownerCloudUser = '';
		// Version number of the installed firmware.
		this.data.version = {major:0, minor:0, revision:0};

		// Other local accounts can use this Choosatron.
		this.data.sharedLocally = false;
		this.data.localAccessToken = '';

		/* These are values received from the cloud. */
		this.isOnline = false;
		// Unique ID of the microcontroller in the Choosatron
		this.data.deviceId = '';
		this.data.lastApp = null;
		this.data.lastHeard = null;
		this.data.lastIpAddress = '';
		this.data.name = '';
		this.data.productId = null;

		BaseModel.call(this, aData);
	}

	Choosatron.methods = {

		updateCloudValues: function(aData) {
			if (aData.id) {
				this.data.deviceId = aData.id;
			}
			if (aData.connected) {
				this.data.isOnline = aData.connected;
			}
			if (aData.last_heard) {
				this.data.lastHeard = aData.last_heard;
			}
			if (aData.last_ip_address) {
				this.data.lastIpAddress = aData.last_ip_address;
			}
			if (aData.name) {
				this.data.name = aData.name;
			}
			if (aData.product_id) {
				this.data.productId = aData.product_id;
			}

			console.log("Updated Choosatron Values:");
			console.log(this.data);
		},

		/*updateValues: function(aChoosatron) {
			// Very shallow copy of the choosatron.
			var types = ['string', 'number', 'boolean'];
			for (var key in aChoosatron.data) {
				var value = aChoosatron[key];
				var type = typeof(value);
				if (types.indexOf(type) < 0) {
					continue;
				}
				this.data[key] = value;
			}
		},*/

		/* Non Serialized */
		/*isClaimed: function() {
			return this.isClaimed;
		},*/

		isWired: function() {
			return this.isWired;
		},

		setWired: function(aValue) {
			this.isWired = aValue;
		},

		getSerialPath: function() {
			return this.serialPath;
		},

		setSerialPath: function(aValue) {
			this.serialPath = aValue;
		},

		/* Serialized */
		getFriendlyName: function() {
			return this.data.friendlyName || "John Doetron (Give me a fun name!)";
		},

		setFriendlyName: function(aValue) {
			console.log("Set friendly name: " + aValue);
			this.data.friendlyName = aValue;
			this.wasModified();
		},

		getOwnerName: function() {
			return this.data.ownerName || "Unknown";
		},

		setOwnerName: function(aValue) {
			console.log("Set owner name: " + aValue);
			this.data.ownerName = aValue;
			this.wasModified();
		},

		getOwnerCloudUser: function() {
			return this.data.ownerCloudUser || "Unknown";
		},

		setOwnerCloudUser: function(aValue) {
			this.data.ownerCloudUser = aValue;
			this.wasModified();
		},

		getVersion: function() {
			return this.data.version;
		},

		getVersionStr: function() {
			var str = this.data.version.major + '.' +
			          this.data.version.minor + '.' +
			          this.data.version.revision;
			return str;
		},

		setVersion: function(aMajor, aMinor, aRevision) {
			if (typeof(aMajor) === 'number') {
				this.data.version.major = aMajor;
			}
			if (typeof(aMinor) === 'number') {
				this.data.version.minor = aMinor;
			}
			if (typeof(aRevision) === 'number') {
				this.data.version.revision = aRevision;
			}
			this.wasModified();
		},

		sharedLocally: function() {
			return this.data.sharedLocally;
		},

		setSharedLocally: function(aValue) {
			this.data.sharedLocally = aValue;
			this.wasModified();
		},

		getLocalAccessToken: function() {
			return this.data.localAccessToken;
		},

		setLocalAccessToken: function(aValue) {
			this.data.localAccessToken = aValue;
			this.wasModified();
		},

		isOnline: function() {
			return this.isOnline;
		},

		setOnline: function(aValue) {
			this.isOnline = aValue;
		},

		getDeviceId: function() {
			return this.data.deviceId;
		},

		setDeviceId: function(aValue) {
			this.data.deviceId = aValue;
		},

		getLastApp: function() {
			return this.data.lastApp;
		},

		getLastHeard: function() {
			return this.data.lastHeard;
		},

		getLastIpAddress: function() {
			return this.data.lastIpAddress;
		},

		getName: function() {
			return this.data.name;
		},

		setName: function(aValue) {
			this.data.name = aValue;
			this.wasModified();
		},

		getProductId: function() {
			return this.data.productId;
		},

		setProductId: function(aValue) {
			this.data.productId = aValue;
			this.wasModified();
		}

	};

	BaseModel.extend(Choosatron, Choosatron.methods);

	return Choosatron;
}
]);
