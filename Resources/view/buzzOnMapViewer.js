Ti.include('../model/modelLocator.js');

var win = Ti.UI.currentWindow;
var model = win.model;

var b = Titanium.UI.createButton({title:'BACK'});
b.addEventListener('click', function() {
	win.close();
});
win.leftNavButton = b;

function init(){
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

