(function() {
'use strict';

angular.module('storyApp.utils')
.factory('manifest', chrome.runtime.getManifest);

}());
