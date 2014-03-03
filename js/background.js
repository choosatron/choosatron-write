/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
  	'id': 'archimedes',
    'bounds': {
      'width': 960,
      'height': 600
    },
    'minWidth': 900,
    'minHeight': 400
  });
});