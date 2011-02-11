Ti.include('../model/modelLocator.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;

/**
 * Initial entry
 */
function init() {
	Base.attachMyBACKButton(win);
	var webview = Ti.UI.createWebView();
	var lat = model.getUserLat();
	var lng = model.getUserLng();
	webview.url = model.getBaseUrl() + '/buzzmap?lat=' + lat + '&lng=' + lng;
	webview.scalesPageToFit = true;
	webview.addEventListener('load', function(e){
		Ti.API.debug("MapView loaded: " + e.url);
	});
	win.add(webview);
};


init();
