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

	BaseModel.extend(Auth, {});

	return Auth;
}
]);
