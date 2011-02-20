Ti.include('../model/modelLocator.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var hotSpot = win.hotSpot;
var nativeMap = null;
var googleMap = null;

function loadNativeMap() {
	var lat = hotSpot.lat;
	var lng = hotSpot.lng;
	
	Ti.API.info('loadNativeMap: lat=' + lat + ' lng=' + lng);
	
	var img = Titanium.Map.createAnnotation({
    	latitude:lat,
    	longitude:lng,
    	title:hotSpot.location,
    	subtitle:hotSpot.desc,
		image:'../images/Marker.png',
    	animate:true,
    	myid:1 // CUSTOM ATTRIBUTE THAT IS PASSED INTO EVENT OBJECTS
	});

	var mapview = Titanium.Map.createView({
    	mapType: Titanium.Map.STANDARD_TYPE,
    	region: {latitude:lat, longitude:lng, latitudeDelta:0.01, longitudeDelta:0.01},
    	animate: true,
    	regionFit: true,
    	userLocation: true,
    	annotations:[ img ] 
	});
	return mapview;
};

function loadGoogleMap() {
	var googleMap = Ti.UI.createWebView();
	var lat = hotSpot.lat;
	var lng = hotSpot.lng;
	googleMap.url = model.getBaseUrl() + '/hsmap?id=' + hotSpot.hotSpotId;
	googleMap.scalesPageToFit = true;
	return googleMap;
};

/**
 * Initial entry
 */
function init() {
	Base.attachMyBACKButton(win);
	if (hotSpot != null) {
		
		/*
		var googleMap = loadGoogleMap();
		googleMap.addEventListener('error', function(e){
			nativeMap = loadNativeMap();
			win.add(nativeMap);
		});
		win.add(googleMap);
		*/
		nativeMap = loadNativeMap();
		win.add(nativeMap);
	}
	else {
		Ti.API.error('Incoming hotSpot object is MISSING');
	}
};


init();

