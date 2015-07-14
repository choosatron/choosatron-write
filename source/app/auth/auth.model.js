angular.module('storyApp.models')
.factory('Auth', ['BaseModel',
function(BaseModel) {

	function Auth(aData) {
		if (!aData) {
			this.data.created = Date.now();
		}

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

		getUsername: function() {
			return this.data.username;
		},

		setUsername: function(aValue) {
			this.data.username = aValue;
			this.wasModified();
		},

		getToken: function() {
			return this.data.token;
		},

		setToken: function(aValue) {
			this.data.token = aValue;
			this.wasModified();
		},

		getType: function() {
			return this.data.type;
		},

		setType: function(aValue) {
			this.data.type = aValue;
			this.wasModified();
		},

		getExpiration: function() {
			return this.data.expiration;
		},

		setExpiration: function(aValue) {
			this.data.expiration = aValue;
		},

		getDevices: function() {
			return this.data.devices;
		},

		setDevices: function(aValue) {
			this.data.devices = aValue;
		},
	};

	BaseModel.extend(Auth, Auth.methods);

	return Auth;
}
]);
