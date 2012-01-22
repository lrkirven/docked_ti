Ti.include('util/common.js');
Ti.include('util/msgs.js');
Ti.include('util/date.format.js');
Ti.include('util/tools.js');
Ti.include('util/tea.js');
Ti.include('props/cssMgr.js');
Ti.include('model/modelLocator.js');
Ti.include('client/picasaClient.js');
Ti.include('client/restClient.js');


//////////////////////////////////////////////////////////////////////////////////
// Globals
//////////////////////////////////////////////////////////////////////////////////

var myFont = 'Verdana';
var model = new ModelLocator();
Ti.Geolocation.purpose = "Recieve User Location";

var myFont = 'Verdana';
var db = Titanium.Database.open('db.docked.co');
if (Common.RESET_APP) {
	db.execute('DROP TABLE IF EXISTS AppParams');
}
db.execute('CREATE TABLE IF NOT EXISTS AppParams (id INTEGER PRIMARY KEY, name VARCHAR(30), valueStr TEXT, valueInt INTEGER)');
if (Common.RESET_FB) {
	db.execute("DELETE FROM AppParams WHERE name = 'FB_ACCESS_TOKEN'");
}
var tabGroup = null;
var buzzTab = null;
var hotspotTab = null;
var reportsTab = null;
var settingsTab = null;
var registerWin = null;
var promptWin = null;
var promptDisplayNameWin = null;
var posListenerSet = false;

//////////////////////////////////////////////////////////////////////////////////
// DB related methods
//////////////////////////////////////////////////////////////////////////////////

/**
 * Determines if user has registered
 */
function hasUserRegistered() {
	var count = 0;
    var rowcpt = db.execute("SELECT COUNT(*) FROM AppParams WHERE name = 'LLID'");
    while (rowcpt.isValidRow()) {
        count = rowcpt.field(0);
        rowcpt.next();
    }
    return (count > 0);
};

/**
 * Adds user's registration to local database.
 * 
 * @param {Object} llId
 * @param {Object} emailAddr
 * @param {Object} displayName
 * @param {Object} fbKey
 * @param {Object} fbSecret
 * @param {Object} pUser
 * @param {Object} pPassword
 * @param {Object} serverSecret
 */
function addRegistration(llId, emailAddr, displayName, fbKey, fbSecret, pUser, pPassword, serverSecret, wpApiKey) {
	var rows = 0;
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('LLID', '" + llId + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('EMAILADDR', '" + emailAddr + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('DISPLAYNAME', '" + displayName + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('FBKEY', '" + fbKey + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('FBSECRET', '" + fbSecret + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('PUSER', '" + pUser + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('PPASSWORD', '" + pPassword + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('SERVERSECRET', '" + serverSecret + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('SYNC_TO_FB', '', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('SYNC_TO_TW', '', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('USE_FB_PIC', '', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('FB_PROFILE_PIC', 'NULL', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('WPAPIKEY', '" + wpApiKey + "', 0)");
	Ti.API.info("addRegistration():  rows --> " +  rows);
};

function dbDeleteFacebookAccessToken() {
	db.execute("DELETE FROM AppParams WHERE name = 'FB_ACCESS_TOKEN'");	
};

/**
 * Loads the user registration data from the local database
 */
function loadApplicationConfiguration() {
	var rows = 0;
    var rowcpt = null;
	var val = null;
	
	// server secret
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'SERVERSECRET'");
	var serverSecret = null;
	var serverSecretStr = null;
    if (rowcpt.isValidRow()) {
        serverSecret = rowcpt.fieldByName('valueStr');
		serverSecretStr = Tea.decrypt(serverSecret, model.getPW1());
		model.setPW2(serverSecretStr);
    }

	// ll Id	
    rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'LLID'");
	var llId = null;
	var llIdStr = null;
    if (rowcpt.isValidRow()) {
        llId = rowcpt.fieldByName('valueStr');
		llIdStr = Tea.decrypt(llId, model.getPW1());
    }
	var c2sLLId = Tea.encrypt(llIdStr, model.getPW2());
	
	// email address
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'EMAILADDR'");
	var emailAddr = null;
	var emailAddrStr = null;
    if (rowcpt.isValidRow()) {
        emailAddr = rowcpt.fieldByName('valueStr');
		emailAddrStr = Tea.decrypt(emailAddr, model.getPW1());
    }
	
	// display name
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'DISPLAYNAME'");
	var displayName = null;
    if (rowcpt.isValidRow()) {
        displayName = rowcpt.fieldByName('valueStr');
    }
	
	Ti.API.info('loadApplicationConfiguration(): Creating user instance --> emailAddr=' + emailAddrStr + ' displayName=' + displayName + 'idClear=' + llIdStr);
	
	var user = { emailAddr:emailAddrStr, displayName:displayName, idClear:llIdStr, id:c2sLLId };
	model.setCurrentUser(user);
	
	// wbApiKey
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'WPAPIKEY'");
	var wpKey = null;
	var wpKeyStr = null;
    if (rowcpt.isValidRow()) {
        wpKey = rowcpt.fieldByName('valueStr');
		wpKeyStr = Tea.decrypt(wpKey, model.getPW1());
		model.setWPApiKey(wpKeyStr);
    }
	
	// fb key
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'FBKEY'");
	var fbKey = null;
	var fbKeyStr = null;
    if (rowcpt.isValidRow()) {
        fbKey = rowcpt.fieldByName('valueStr');
		fbKeyStr = Tea.decrypt(fbKey, model.getPW1());
		Ti.API.info('loadApplicationConfiguration(): fbKey=' + fbKeyStr);
		model.setFBAPIKey(fbKeyStr);
    }
	
	// fb secret
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'FBSECRET'");
	var fbSecret = null;
	var fbSecretStr = null;
    if (rowcpt.isValidRow()) {
        fbSecret = rowcpt.fieldByName('valueStr');
		fbSecretStr = Tea.decrypt(fbSecret, model.getPW1());
		Ti.API.info('loadApplicationConfiguration(): fbSecret=' + fbSecretStr);
		model.setFBSecret(fbSecretStr);
    }
	
	// picasa user
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'PUSER'");
	var pUser = null;
	var pUserStr = null;
    if (rowcpt.isValidRow()) {
        pUser = rowcpt.fieldByName('valueStr');
		pUserStr = Tea.decrypt(pUser, model.getPW1());
		model.setPicasaUser(pUserStr);
    }
	
	// picasa password
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'PPASSWORD'");
	var pPassword = null;
	var pPasswordStr = null;
    if (rowcpt.isValidRow()) {
        pPassword = rowcpt.fieldByName('valueStr');
		pPasswordStr = Tea.decrypt(pPassword, model.getPW1());
		model.setPicasaPassword(pPasswordStr);
    }
	
	// sync to twitter
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'SYNC_TO_TW'");
    if (rowcpt.isValidRow()) {
        val = rowcpt.fieldByName('valueInt');
		if (val > 0) {
			Ti.API.info('loadApplicationConfiguration(): SYNC_TO_TW TRUE');
			model.setSync2Tw(true);	
		}
		else {
			Ti.API.info('loadApplicationConfiguration(): SYNC_TO_TW FALSE');
			model.setSync2Tw(false);	
		}
    }
	else {
		Ti.API.info('loadApplicationConfiguration(): SYNC_TO_TW -- NOT FOUND -- ADDING');
    	db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('SYNC_TO_TW', '', 0)");
	}
	
	// sync to facebook
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'SYNC_TO_FB'");
    if (rowcpt.isValidRow()) {
        val = rowcpt.fieldByName('valueInt');
		if (val > 0) {
			Ti.API.info('loadApplicationConfiguration(): SYNC_TO_FB TRUE');
			model.setSync2Fb(true);	
		}
		else {
			Ti.API.info('loadApplicationConfiguration(): SYNC_TO_FB FALSE');
			model.setSync2Fb(false);	
		}
    }
	else {
		Ti.API.info('loadApplicationConfiguration(): SYNC_TO_FB -- NOT FOUND');
	}
	
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'USE_FB_PIC'");
    if (rowcpt.isValidRow()) {
        val = rowcpt.fieldByName('valueInt');
		if (val > 0) {
			Ti.API.info('loadApplicationConfiguration(): USE_FB_PIC TRUE');
			model.setUseFBProfilePic(true);	
		}
		else {
			Ti.API.info('loadApplicationConfiguration(): USE_FB_PIC FALSE');
			model.setUseFBProfilePic(false);	
		}
    }
	else {
		Ti.API.info('loadApplicationConfiguration(): USE_FB_PIC -- NOT FOUND');
	}
	
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'FB_PROFILE_PIC'");
    if (rowcpt.isValidRow()) {
        val = rowcpt.fieldByName('valueStr');
		Ti.API.info('loadApplicationConfiguration(): FB Profile Url: ' + val);
		model.setFBProfileUrl(val);	
    }
	else {
		Ti.API.info('loadApplicationConfiguration(): FB_PROFILE_PIC -- NOT FOUND');
	}
	
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'FB_ACCESS_TOKEN'");
    if (rowcpt.isValidRow()) {
        val = rowcpt.fieldByName('valueStr');
		Ti.API.info('loadApplicationConfiguration(): FB Access Token: ' + val);
		model.setFbAccessToken(val);	
    }
	else {
		Ti.API.info('loadApplicationConfiguration(): FB_PROFILE_PIC -- NOT FOUND');
	}
	
	Ti.API.info("loadApplicationConfiguration(): Done");
};

/**
 * Indicates if the user declinded registration.
 */
function hasUserDeclined() {
	var count = 0;
    var rowcpt = db.execute("SELECT COUNT(*) FROM AppParams WHERE name = 'DECLINE_REGISTRATION'");
    while (rowcpt.isValidRow()) {
        count = rowcpt.field(0);
        rowcpt.next();
    }
    return (count > 0);
};

function markUserDeclineRegistration() {
	var count = 0;
    var rowcpt = db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('DECLINE_REGISTRATION', 'Y', 0)");
};

function updateDisplayName(displayName) {
	var count = 0;
    var rowcpt = db.execute("UPDATE AppParams SET valueStr = '" + displayName + "' WHERE name = 'DISPLAYNAME'");
};


//////////////////////////////////////////////////////////////////////////////////
// Event listeners 
//////////////////////////////////////////////////////////////////////////////////

/**
 * Listener to handle event to determine user's location to local lakes.
 * 
 * @param {Object} e
 */
Titanium.App.addEventListener('PING_RESPONSE_DATA', function(e) {
	Ti.API.info('Handling event -- PING_RESPONSE_DATA --> ' + e);
	
	if (e.status == 0) {
		var pingResp = e.result;
		if (pingResp != null) {
			//
			// if the user is in a defined lake polygon
			//	
			if (pingResp.resKey != null) {
				Ti.API.info('Got Lake: ' + pingResp.resourceName + ' state: ' + pingResp.resourceState + ' resKey: ' + pingResp.resKey + 
				' UserToken: ' + pingResp.userToken + ' Locals: ' + pingResp.numOfLocalLakers);
				var lake = {
					name: pingResp.resourceName,
					state: pingResp.resourceState,
					resKey: pingResp.resKey,
					numOfLazyLakers: pingResp.numOfLazyLakers,
					localCount: pingResp.numOfLocalLakers
				};
				var user = model.getCurrentUser();
				if (user != null) {
					user.userToken = pingResp.userToken;
				}
				model.setCurrentLake(lake);
				Ti.App.fireEvent('LOCATION_CHANGED', {});
				var client = new RestClient();
				client.getLocalMsgEvents(pingResp.resKey);
			}
			else {
				Ti.API.info('*** User is not within one of our polygons ***');
				model.setCurrentLake(null);
				Ti.App.fireEvent('LOCATION_CHANGED', {});
				Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', {
					result: [],
					status: 0
				});
				
				var w = Titanium.UI.createWindow({
					title: Msgs.APP_NAME,
					color: CSSMgr.color2,
					font: { fontSize: 20, fontFamily: myFont },
					backgroundColor: CSSMgr.color0,
					barColor: CSSMgr.color0,
					url: 'view/outOfZoneAlertMsg.js'
				});
				w.model = model;
				w.open();
			}
		}
		else {
			model.setCurrentLake(null);
		}
	}
	else {
		model.setCurrentLake(null);
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);
	}
});

/**
 * THis method handle changes in the user's position.
 * 
 * @param {Object} e
 */
function handleInitialUserPosition(e) {
	if (e.error) {
		Tools.reportMsg(Msgs.APP_NAME, 'System Error :: ' + JSON.stringify(e.error));
		return;
	}
	
	var lat = e.coords.latitude;
	var lng = e.coords.longitude;
	var timestamp = e.coords.timestamp;
	var accuracy = e.coords.accuracy;
	
	model.setActualLng(lng);
	model.setActualLat(lat);
	Ti.App.fireEvent('REAL_POSITION_CHANGED', {});

	var bUpdateServer = false;
	var now = new Date();
	var tm = now.getTime();
	if (model.getUserLat() == 0 && model.getUserLng() == 0) {
		bUpdateServer = true;
	}
	else {
		var lakePoly = model.getCurrentLake();
		//
		// we are in a lake polygon
		//
		var diffInMsecs = 0;
		var diffInMins = 0;
		var oldLat = 0;
		var oldLng = 0;
		var diff = 0;
		
		/*
		 * if inside of the polygon, then update server every 15
		 */
		if (lakePoly != null) {
			var lastPing = model.getLastPing();
			diffInMsecs = tm - lastPing;
			diffInMins = ((diffInMsecs / 1000) / 60);
			if (diffInMins > 15) {
				bUpdateServer = true;
			}
			else {
				oldLat = model.getUserLat();
				oldLng = model.getUserLng();
				Ti.API.info('Calc dist: oldLat=' +  oldLat + ' oldLng=' + oldLng + ' lat=' + lat + ' lng=' + lng);
				diff = Tools.distanceFromAB(oldLat, oldLng, lat, lng);
				if (diff > 1) {
					bUpdateServer = true;
				}
			}
		}
		/*
		 * if outside of polygon, check more often
		 */
		else {
			lastPing = model.getLastPing();
			diffInMsecs = tm - lastPing;
			diffInMins = ((diffInMsecs / 1000) / 60);
			if (diffInMins > 5) {
				bUpdateServer = true;
			}
			else {
				oldLat = model.getUserLat();
				oldLng = model.getUserLng();
				Ti.API.info('Calc dist: oldLat=' +  oldLat + ' oldLng=' + oldLng + ' lat=' + lat + ' lng=' + lng);
				diff = Tools.distanceFromAB(oldLat, oldLng, lat, lng);
				if (diff > .75) {
					bUpdateServer = true;
				}
			}
			
		}
	}
	

	//
	// update server
	//
	if (bUpdateServer) {
		//
		// hardcoding Lake Ray Roberts
		//
		if (Common.DEBUG) {
			// lat = 32.859258;
			// lat = 33.30424880981445;
			lat = 33.108798;
			// lng = -96.520557;
			// lng = -96.5897216796875
			lng = -96.966705;
		}
		
		model.setUserLng(lng);
		model.setUserLat(lat);
		Titanium.API.info('lat: ' + lat);
		Titanium.API.info('lng: ' + lng);
		Titanium.API.info('geo - current location: ' + new Date(timestamp) + ' lng ' + lng + ' lat ' + lat + ' accuracy ' + accuracy);
		//
		// determine if we are inside a local lake polygon
		//
		var client = new RestClient();
		//
		// anonymous user
		//
		var llId = Common.ANONYMOUS_USER;
		var user = model.getCurrentUser();
		//
		// if we have a real user, use their id
		//
		if (user != null) {
			llId = user.id;
		}
		
		//
		// alert remote services where I am located
		//
		Titanium.API.info('Last Ping updated to ---> ' + tm);
		model.setLastPing(tm);
		client.ping(llId, lat, lng);
		// googleMapReverseGeocode(lat, lng);
		// yahooMapReverseGeoCode(lat, lng);
	}
};

Titanium.App.addEventListener('EXIT_APP', function(e) {
	tabGroup.close();
});
	

Titanium.App.addEventListener('LOCATION_CHANGED', function(e) {
	var now = new Date();
	var tm = now.getTime();
	model.setLastLocTime(tm);	
	tabGroup.enabled = true;
});

Titanium.App.addEventListener('GOOGLE_MAP_LOADED', function(e) { 
	Ti.API.info('My Google Map is loaded!!');
});


Titanium.App.addEventListener('UPDATED_DISPLAY_NAME', function(e) { 
	if (e.status == 0) {
		Ti.API.info('*** UPDATED_DISPLAY_NAME -->' + e.displayName);
		var displayName = Titanium.Network.decodeURIComponent(e.displayName);
		model.getCurrentUser().displayName = displayName;
		updateDisplayName(displayName);
		
		if (promptDisplayNameWin != null) {
			promptDisplayNameWin.close();
			tabGroup.setActiveTab(0);
			tabGroup.open();
			//
			// start geo positioning
			//
			if (!posListenerSet) {
				posListenerSet = true;
				Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
				Titanium.Geolocation.getCurrentPosition(handleInitialUserPosition);
			}
		}
	}
	
});

/**
 * User registered their application
 * 
 * @param {Object} e
 */
Titanium.App.addEventListener('USER_REGISTERED', function(e) { 

	Ti.API.info('Registration complete --> ' + e.status);
	
	if (e.status == 0) {
		
		if (registerWin != null) {
			registerWin.close();
		}
		
		var token = e.token;
		// server secret
		var serverSecret = token.serverSecret;
		var serverSecretStr = Tea.decrypt(serverSecret, model.getPW1());
		Ti.API.info('Server Secret: [' + serverSecretStr + ']');
		model.setPW2(serverSecretStr);
		
		// email address
		var emailAddr = token.emailAddr;
		var emailAddrStr = Tea.decrypt(emailAddr, model.getPW1());
		Ti.API.info('Email Address: [' + emailAddrStr + ']');
					
		// displayName
		var nickname = token.nickname;
			
		// ll id
		var llid = token.llId;
		var llIdStr = Tea.decrypt(llid, model.getPW1());
		Ti.API.info('LL Id: [' + llIdStr + ']');
		
		// encrypt id for client to server key
		Ti.API.info('Encrypting clear id=' + llIdStr + ' with key [' + serverSecretStr + ']');
		var llIdCrypted = Tea.encrypt(llIdStr, serverSecretStr);
		Ti.API.info('NEW llId for sending to server [' + llIdCrypted + ']');
		var d = Tea.decrypt(llIdCrypted, serverSecretStr);
		Ti.API.info('----------------> ' + d);
		
		var u = { emailAddr:emailAddrStr, displayName:nickname, idClear:llIdStr, id:llIdCrypted };
		model.setCurrentUser(u);
				
		// facebook key
		var fbKey = token.fbKey;
		var fbKeyStr = Tea.decrypt(fbKey, model.getPW1());
		Ti.API.info('FB Key: [' + fbKeyStr + ']');
		model.setFBAPIKey(fbKey.text);
			
		// facebook secret	
		var fbSecret = token.fbSecret;
		var fbSecretStr = Tea.decrypt(fbSecret, model.getPW1());
		Ti.API.info('FB Secret: [' + fbSecretStr + ']');
		model.setFBSecret(fbSecretStr);
		
		// picasa user	
		var pUser = token.picasaUser;
		var pUserStr = Tea.decrypt(pUser, model.getPW1());
		Ti.API.info('Picasa User: [' + pUserStr + ']');
		model.setPicasaUser(pUserStr);
				
		// picasa password	
		var pPassword = token.picasaPassword;
		var pPasswordStr = Tea.decrypt(pPassword, model.getPW1());
		Ti.API.info('Picasa Password: [' + pPasswordStr + ']');
		model.setPicasaPassword(pPasswordStr);
		
		var wpApiKey = token.wpApiKey;
		var wpApiKeyStr = Tea.decrypt(wpApiKey, model.getPW1());
		Ti.API.info('WebPurity API Key: [' + wpApiKeyStr + ']');
		model.setWPApiKey(wpApiKeyStr);
			
		addRegistration(llid, emailAddr, nickname, fbKey, fbSecret, pUser, pPassword, serverSecret, wpApiKey);
				
		
		Tools.reportMsg(Msgs.APP_NAME, "Registration Complete.");
		
		resetTabs();
		tabGroup.setActiveTab(0);
		tabGroup.open();
		Titanium.Geolocation.getCurrentPosition(handleInitialUserPosition);
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.token.errorMsg);
	}
});

/**
 * This method handles user response if they want to become a registered user on Docked
 * @param {Object} e
 */
Titanium.App.addEventListener('PROMPT_USER_TO_REGISTER_COMPLETE', function(e) { 
	Ti.API.info('registerFlag -->' + e.registerFlag);
	if (promptWin != null) {
		promptWin.close();	
	}
	if (e.registerFlag) {
		tabGroup.close();
		registerWin = Titanium.UI.createWindow({
			title: Msgs.APP_NAME,
			color: CSSMgr.color2,
			font: { fontSize: 20, fontFamily: myFont },
			backgroundColor: CSSMgr.color0,
			barColor: CSSMgr.color0,
			url: 'view/basicRegisterUser.js'
		});
		registerWin.model = model;
		registerWin.db = db;
		registerWin.open();
	}
	else {
		model.setCurrentUser(null);
		markUserDeclineRegistration();	
		if (registerWin != null) {
			registerWin.close();
		}
		tabGroup.setActiveTab(0);
		tabGroup.open();
		//
		// start geo positioning
		//
		if (!posListenerSet) {
			posListenerSet = true;
			Titanium.Geolocation.getCurrentPosition(handleInitialUserPosition);
		}
	}
});

Ti.App.addEventListener('GOTO_TAB', function(e) {
	Ti.API.info('app: Got gotoTab event -->' + e.nextTab);
	tabGroup.setActiveTab(e.nextTab);
});

function yahooMapReverseGeoCode(lat, lng) {
	Titanium.Yahoo.yql('select * from yahoo.maps.findLocation where q="' + lat + ',' + lng + '" and gflags="R"',function(e) {
		Ti.API.info('YAHOO RESP :: ' + e.data.ResultSet.Results);
		var item = e.data.ResultSet.Results;
		var j = null;
		for (j in item) {
			Ti.API.info('key=' + j + ' value=' + item[j]);
		}
	});	
};

function googleMapReverseGeocode(lat,lng){
    var url="http://maps.google.com/maps/api/geocode/json?latlng="+lat+","+lng+"&sensor=false";
    xhr = Titanium.Network.createHTTPClient();
    xhr.open('GET',url);
    xhr.onload = function() {
		Ti.API.info("RESP :: " + this.responseText);
        var json = this.responseText;
        var gotitems = eval('(' + json + ')');
		var i = 0;
		var j = null;
		var lastLocList = [];
		var count = 0;
		for (i=0; i<gotitems.results.length; i++) {
        	var item = gotitems.results[i];
        	Ti.API.info(i + ') LOCATION : '+ gotitems.results[i].formatted_address);
			lastLocList.push(gotitems.results[i].formatted_address);
			if (lastLocList.length == 3) {
				break;
			}	
		}
    };
	xhr.send(); 
};


function buildAppTabs() {
	
	////////////////////////////////////////////////////////////
	//
	// Buzz
	//
	////////////////////////////////////////////////////////////
	
	var buzzWin = Titanium.UI.createWindow({
		color: CSSMgr.color2,
		font: { fontSize: 20, fontFamily: myFont },
		barColor: CSSMgr.color0,
		barImage: 'images/Header.png',
		url: 'view/buzzMain.js'
	});
	buzzWin.addEventListener('focus', function(e){
		Ti.API.info('app: Buzz Window has focus -- ' + (e.source).url);
	});
	buzzWin.model = model;
	buzzWin.db = db;
	buzzTab = Titanium.UI.createTab({
		height:'auto', 
		width:'auto,',
		icon: 'images/ChatBubble.png',
		window: buzzWin
	});
	
	////////////////////////////////////////////////////////////
	//
	// Hotspots
	//
	////////////////////////////////////////////////////////////
	
	var hsWin = Titanium.UI.createWindow({
		color: CSSMgr.color2,
		font: { fontSize: 20, fontFamily: myFont },
		barColor: CSSMgr.color0,
		barImage: 'images/Header.png',
		url: 'view/hotSpotMain.js'
	});
	hsWin.addEventListener('focus', function(e){
		Ti.API.info('app: HotSpot Window has focus -- ' + (e.source).url);
	});
	hsWin.model = model;
	hsWin.db = db;
	hotspotTab = Titanium.UI.createTab({
		icon: 'images/HotSpot.png',
		window: hsWin
	});
	
	
	////////////////////////////////////////////////////////////
	//
	// Fishing Reports
	//
	////////////////////////////////////////////////////////////
	
	var reportsWin = Titanium.UI.createWindow({
		font: { fontSize: 20, fontFamily: myFont },
		barColor: CSSMgr.color0,
		barImage: 'images/Header.png',
		url: 'view/reportViewer.js'
	});
	reportsWin.addEventListener('focus', function(e){
		Ti.API.info('app: win3 is active -- ' + (e.source).url);
	});
	reportsWin.model = model;
	reportsTab = Titanium.UI.createTab({
		icon: 'images/Fish.png',
		window: reportsWin
	});
	var label3 = Titanium.UI.createLabel({
		color: '#BDBB99',
		text: 'Fishing Reports',
		font: { fontSize: 20, fontFamily: myFont },
		textAlign: 'center',
		width: 'auto'
	});
	reportsWin.add(label3);
	
	
	////////////////////////////////////////////////////////////
	//
	// Settings
	//
	////////////////////////////////////////////////////////////
	
	var settingsWin = Titanium.UI.createWindow({
		font: { fontSize: 20, fontFamily: myFont },
		barColor: CSSMgr.color0,
		barImage: 'images/Header.png',
		url: 'view/settingsMain.js'
	});
	settingsWin.addEventListener('focus', function(e){
		Ti.API.info('win4 is active -- ' + (e.source).url);
	});
	settingsWin.model = model;
	settingsWin.db = db;
	settingsTab = Titanium.UI.createTab({
		icon: 'images/Gears.png',
		window: settingsWin
	});
};

function resetTabs() {
	if (buzzTab != null) {
		tabGroup.removeTab(buzzTab);
	}
	if (hotspotTab != null) {
		tabGroup.removeTab(hotspotTab);
	}
	if (reportsTab != null) {
		tabGroup.removeTab(reportsTab);
	}
	if (settingsTab != null) {
		tabGroup.removeTab(settingsTab);
	}
	buildAppTabs();
	tabGroup = Titanium.UI.createTabGroup();
	tabGroup.addTab(buzzTab);
	tabGroup.addTab(hotspotTab);
	tabGroup.addTab(reportsTab);
	tabGroup.addTab(settingsTab);
};

function loadiPhoneView() {
	//
	// build init UI
	//
	resetTabs();
	tabGroup.enabled = false;
	
	//
	// check if user has registered as an user of the app
	//
 	if (hasUserRegistered()) {
		//
		// load registration from DB
		//
		loadApplicationConfiguration();
		//
		// open tab group
		//
		tabGroup.setActiveTab(0);
		tabGroup.open();
		//
		// start geo positioning
		//
		if (!posListenerSet) {
			posListenerSet = true;
			Titanium.Geolocation.getCurrentPosition(handleInitialUserPosition);
		}
	}
	else {
		if (!hasUserDeclined()) {
			promptWin = Titanium.UI.createWindow({
				title: Msgs.APP_NAME,
				color: CSSMgr.color2,
				font: { fontSize: 20, fontFamily: myFont },
				backgroundColor: CSSMgr.color0,
				barColor: CSSMgr.color0,
				url: 'view/promptUserToRegister.js'
			});
			promptWin.model = model;
			promptWin.db = db;
			promptWin.open();
		}
		//
		// user decided that they don't want to register right now
		//
		else {
			model.setCurrentUser(null);
			tabGroup.setActiveTab(0);
			tabGroup.open();
			//
			// start geo positioning
			//
			if (!posListenerSet) {
				posListenerSet = true;
				Titanium.Geolocation.getCurrentPosition(handleInitialUserPosition);
			}
		}
	}
};

/**
 * Entry point
 */
function init() {
	var now = new Date();	
	var timeStr = now.format();
	Ti.API.info('APP STARTING :: ' + timeStr);
	/*
	 * reset db
	 */
	db.execute("DELETE FROM AppParams WHERE name = 'DECLINE_REGISTRATION'");
	/*
	 * encrypt registration key with anonymous key
	 */
	var regSecretClear = model.getPW3();
	var regSecret = Tea.encrypt(regSecretClear, model.getPW4());
	model.setPW3(regSecret);
	/*
	 * set personal device id with encrypted anonymous key
	 */
	var anonymousUserId = 'MY_DEVICE_ID' + '=' + Titanium.Platform.id;
	var cipherText = Tea.encrypt(anonymousUserId, model.getPW4());
	model.setDeviceId(cipherText);
	/*
	 * load iPhone View
	 */	
	loadiPhoneView();
};

init();

