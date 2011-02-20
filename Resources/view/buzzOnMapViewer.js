Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/tools.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var nativeMap = null;
var googleMap = null;

Titanium.App.addEventListener('LOCAL_MSG_EVENTS_RECD', function(e) {
	var i = 0;
	var buzzMsg = null;
	var buzzMsgIconList = [];
	if (e.status == 0) {
		Ti.API.info('Handling event -- LOCAL_MSG_EVENTS_RECD --> ' + e.result);
		var list = e.result;
		for (i=0; i<list.length; i++) {
			buzzMsg = list[i];	
			var img = Titanium.Map.createAnnotation({
    			latitude:buzzMsg.lat,
    			longitude:buzzMsg.lng,
    			title:buzzMsg.username + '@' + '[' + buzzMsg.location + ']' ,
    			subtitle:buzzMsg.messageData,
    			pincolor:Titanium.Map.ANNOTATION_RED,
				image:'../images/buzzMarker.png',
    			animate:true,
    			myid:buzzMsg.msgId // CUSTOM ATTRIBUTE THAT IS PASSED INTO EVENT OBJECTS
			});
			buzzMsgIconList.push(img);
		}
		nativeMap.annotations = buzzMsgIconList;
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);			
	}
});


function check4LocalMsgEvents() {
	var client = new RestClient();
	var activeLake = model.getCurrentLake();
	if (activeLake != null) {
		Ti.API.info('check4MsgEvent(): resourceId ---> ' + activeLake.id);
		client.getLocalMsgEvents(activeLake.id);
	}
	else {
		Ti.API.info('check4MsgEvent(): Not in a region to view messages!!!!');
	}
};

/**
 * Loads native map
 */
function loadNativeMap() {
	
	var myLat = model.getUserLat();	
	var myLng = model.getUserLng();
	
	var mapview = Titanium.Map.createView({
   		mapType: Titanium.Map.STANDARD_TYPE,
   		region: {latitude:myLat, longitude:myLng, latitudeDelta:0.01, longitudeDelta:0.01},
   		animate:true,
   		regionFit:true,
   		userLocation:true,
   		annotations:[]
	});

	return mapview;
};

/**
 * Loads remote Google Map from Docked service.
 * 
 * @param {Object} url
 */
function loadGoogleMap(url) {
	var googleMap = Ti.UI.createWebView();
	googleMap.url = url;
	googleMap.scalesPageToFit = true;
	return googleMap;
};

/**
 * Initial entry
 */
function init() {
	Base.attachMyBACKButton(win);
	var myLat = model.getUserLat();	
	var myLng = model.getUserLng();
	var targetUrl = model.getBaseUrl() + '/buzzmap?lat=' + myLat + '&lng=' + myLng + '&version=' + Common.VERSION;
	googleMap = loadGoogleMap(targetUrl);
	googleMap.addEventListener('error', function(e){
		nativeMap = loadNativeMap();
		win.add(nativeMap);
		check4LocalMsgEvents();
	});
	win.add(googleMap);
	
	/*
	nativeMap = loadNativeMap();
	win.add(nativeMap);
	*/
};


init();

