angular.module('storyApp.models')
.factory('Profile', ['Model',
function(Profile) {
	function Profile(data) {
		this.name = '';
		Model.call(this, data);
	}

	Profile.methods = {

	}
	Model.extend(Profile, Profile.methods);

	return Profile;
}
]);
