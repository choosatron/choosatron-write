angular.module('storyApp.models')
.factory('Auth', ['BaseModel',
function(BaseModel) {

	function Auth(aData) {
		this.data = {};

		/* Serialized */
		this.data.username   = '';
		this.data.token      = null;
		this.data.type       = null;
		this.data.expiration = null;
		this.data.devices    = [];

		BaseModel.call(this, aData);
	}

	Auth.methods = {

		isTokenExpired: function() {
			return this.token && +new Date() >= this.getExpiration();
		},

		/* Getters / Setters */

		// Non Serialized //

		// Serialized //

		username: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.username = aValue;
				this.wasModified();
				return;
			}
			return this.data.username;
		},

		/*getUsername: function() {
			return this.data.username;
		},

		setUsername: function(aValue) {
			this.data.username = aValue;
			this.wasModified();
		},*/

		token: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.token = aValue;
				this.wasModified();
				return;
			}
			return this.data.token;
		},

		/*getToken: function() {
			return this.data.token;
		},

		setToken: function(aValue) {
			this.data.token = aValue;
			this.wasModified();
		},*/

		type: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.type = aValue;
				this.wasModified();
				return;
			}
			return this.data.type;
		},

		/*getType: function() {
			return this.data.type;
		},

		setType: function(aValue) {
			this.data.type = aValue;
			this.wasModified();
		},*/

		expiration: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.expiration = aValue;
				this.wasModified();
				return;
			}
			return this.data.expiration;
		},

		/*getExpiration: function() {
			return this.data.expiration;
		},

		setExpiration: function(aValue) {
			this.data.expiration = aValue;
		},*/

		devices: function(aValue) {
			if (angular.isDefined(aValue)) {
				this.data.devices = aValue;
				this.wasModified();
				return;
			}
			return this.data.devices;
		},

		/*getDevices: function() {
			return this.data.devices;
		},

		setDevices: function(aValue) {
			this.data.devices = aValue;
		},*/
	};

	BaseModel.extend(Auth, Auth.methods);

	return Auth;
}
]);
