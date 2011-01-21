Ti.include('../model/modelLocator.js');

var win = Ti.UI.currentWindow;
var model = win.model;

// w.orientationModes = [Titanium.UI.PORTRAIT]; 
 
var webview = Ti.UI.createWebView();
if (model.getCurrentUser() != null) {
	var user = model.getCurrentUser();
	webview.url = model.getBaseUrl() + '/buzzmap?id=' + user.federatedId;
}
else {
	var lat = model.getUserLat();
	var lng = model.getUserLng();
	webview.url = model.getBaseUrl() + '/buzzmap?id=' + model.getAnonymousUser() + '&lat=' + lat + '&lng=' + lng;
}
webview.scalesPageToFit = true;
webview.addEventListener('load',function(e) {
	Ti.API.debug("MapView loaded: "+e.url);
});
win.add(webview);

