Ti.include('../model/modelLocator.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var hotSpot = win.hotSpot;

/**
 * Initial entry
 */
function init() {
	Base.attachMyBACKButton(win);
	if (hotSpot != null) {
		var webview = Ti.UI.createWebView();
		var lat = hotSpot.lat;
		var lng = hotSpot.lng;
		webview.url = model.getBaseUrl() + '/hsmap?id=' + hotSpot.hotSpotId;
		webview.scalesPageToFit = true;
		webview.addEventListener('load', function(e){
			Ti.API.debug("MapView loaded: " + e.url);
		});
		win.add(webview);
	}
	else {
		Ti.API.error('Incoming hotSpot object is MISSING');
	}
};


init();

