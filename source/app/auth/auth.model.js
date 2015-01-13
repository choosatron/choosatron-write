angular.module('storyApp.models')
.factory('Auth', ['BaseModel',
function(BaseModel) {

	function Auth(data) {
		this.created    = Date.now();
		this.username   = '';
		this.token      = null;
		this.type       = null;
		this.expiration = null;

		Object.defineProperty(this, 'expired', {
			get: function() {
				return this.token && +new Date() >= this.expiration;
			}
		});

		BaseModel.call(this, data);
	}

	Auth.methods = {
		/*saveToken: function(token) {
			var now = +new Date();

			this.token      = token.access_token;
			this.type       = token.token_type;
			this.expiration = +new Date(now + (token.expires_in * 1000));

			return this;
		},

		register: function(password) {
			return spark
				.createUser(this.username, password)
				.then(this.login.bind(this, password));
		},

		login: function(password) {
			return spark
				.login({
					username: this.username,
					password: password
				})
				.then(this.saveToken.bind(this));
		},*/
	};

	BaseModel.extend(Auth, Auth.methods);

	return Auth;
}
]);
