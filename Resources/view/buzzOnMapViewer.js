Ti.include('../model/modelLocator.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var nativeMap = null;
var googleMap = null;

function loadNativeMap() {
	
	var myLat = model.getActualLat();	
	var myLng = model.getActualLng();
	
	var img = Titanium.Map.createAnnotation({
    	latitude:myLat,
    	longitude:myLng,
    	title:model.getCurrentLake().name,
    	subtitle:'hey, how are you doing at that end of the lake with my friend from Odessa, Texas',
    	pincolor:Titanium.Map.ANNOTATION_RED,
    	animate:true,
    	leftButton: model.getFBProfileUrl(),
    	myid:1 // CUSTOM ATTRIBUTE THAT IS PASSED INTO EVENT OBJECTS
	});

	var mapview = Titanium.Map.createView({
    	mapType: Titanium.Map.STANDARD_TYPE,
    	region: {latitude:myLat, longitude:myLng, latitudeDelta:0.01, longitudeDelta:0.01},
    	animate:true,
    	regionFit:true,
    	userLocation:true,
    	annotations:[img]
	});
	return mapview;
};

function loadGoogleMap(url) {
	var googleMap = Ti.UI.createWebView();
	var lat = hotSpot.lat;
	var lng = hotSpot.lng;
	googleMap.url = url;
	googleMap.scalesPageToFit = true;
	return googleMap;
};

/**
 * Initial entry
 */
function init() {
	Base.attachMyBACKButton(win);

	/*	
	var targetUrl = model.getBaseUrl() + '/buzzmap?lat=' + lat + '&lng=' + lng;
	googleMap = loadGoogleMap(targetUrl);
	googleMap.addEventListener('error', function(e){
		nativeMap = loadNativeMap();
		win.add(nativeMap);
	});
	win.add(googleMap);
	*/
	nativeMap = loadNativeMap();
	win.add(nativeMap);
};


init();

