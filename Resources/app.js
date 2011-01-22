// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

Ti.include('model/modelLocator.js');
Ti.include('client/picasaClient.js');
Ti.include('client/restClient.js');
Ti.include('props/cssMgr.js');
Ti.include('util/tea.js');


//////////////////////////////////////////////////////////////////////////////////
// Globals
//////////////////////////////////////////////////////////////////////////////////

var myFont = 'Verdana';
var model = new ModelLocator();
var css = CSSMgr();
Ti.Geolocation.purpose = "Recieve User Location";
var myFont = 'Verdana';
var db = Titanium.Database.open('db.lazylaker.net');
db.execute('DROP TABLE IF EXISTS AppParams');
db.execute('CREATE TABLE IF NOT EXISTS AppParams (id INTEGER PRIMARY KEY, name VARCHAR(30), valueStr TEXT, valueInt INTEGER)');
var tabGroup = null;
var buzzTab = null;
var hotspotTab = null;
var reportsTab = null;
var settingsTab = null;
var registerWin = null;
var promptWin = null;
var promptDisplayNameWin = null;

//////////////////////////////////////////////////////////////////////////////////
// DB related methods
//////////////////////////////////////////////////////////////////////////////////

function hasUserRegistered() {
	var count = 0;
    var rowcpt = db.execute("SELECT COUNT(*) FROM AppParams WHERE name = 'LLID'");
    while (rowcpt.isValidRow()) {
        count = rowcpt.field(0);
        rowcpt.next();
    }
    return (count > 0);
}

/**
 * Loads the user registration data from the local database
 */
function loadRegistration() {
	var rows = 0;
    var rowcpt = null;

	// ll Id	
    rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'LLID'");
	var llId = null;
	var llIdStr = null;
    if (rowcpt.isValidRow()) {
        llId = rowcpt.fieldByName('valueStr');
		llIdStr = Tea.decrypt(llId, model.getPW1());
    }
	
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
	
	Ti.API.info('Creating user instance --> emailAddr=' + emailAddrStr + ' displayName=' + displayName + 'idClear=' + llIdStr);
	
	var user = { emailAddr:emailAddrStr, displayName:displayName, idClear:llIdStr, id:llId };
	model.setCurrentUser(user);
	
	// fb key
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'FBKEY'");
	var fbKey = null;
	var fbKeyStr = null;
    if (rowcpt.isValidRow()) {
        fbKey = rowcpt.fieldByName('valueStr');
		fbKeyStr = Tea.decrypt(fbKey, model.getPW1());
		model.setFBAPIKey(fbKeyStr);
    }
	
	// fb secret
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'FBSECRET'");
	var fbSecret = null;
	var fbSecretStr = null;
    if (rowcpt.isValidRow()) {
        fbSecret = rowcpt.fieldByName('valueStr');
		fbSecretStr = Tea.decrypt(fbSecret, model.getPW1());
		model.setFBSecret(fbSecretStr);
    }
	
	// picasa user
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'PUSER'");
	var pUser = null;
	var pUserStr = null;
    if (rowcpt.isValidRow()) {
        pUser = rowcpt.fieldByName('valueStr');
		pUserStr = Tea.decrypt(pUser, model.getPW1());
		model.setPicasaUser(fbSecretStr);
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
	
	// server secret
	rowcpt = db.execute("SELECT * FROM AppParams WHERE name = 'SERVERSECRET'");
	var serverSecret = null;
	var serverSecretStr = null;
    if (rowcpt.isValidRow()) {
        serverSecret = rowcpt.fieldByName('valueStr');
		serverSecretStr = Tea.decrypt(serverSecret, model.getPW1());
		model.setPW2(serverSecretStr);
    }
	Ti.API.info("loadRegistration(): Done");
}

function hasUserDeclined() {
	var count = 0;
    var rowcpt = db.execute("SELECT COUNT(*) FROM AppParams WHERE name = 'DECLINE_REGISTRATION'");
    while (rowcpt.isValidRow()) {
        count = rowcpt.field(0);
        rowcpt.next();
    }
    return (count > 0);
}

function markUserDeclineRegistration() {
	var count = 0;
    var rowcpt = db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('DECLINE_REGISTRATION', 'Y', 0)");
}

function updateDisplayName(displayName) {
	var count = 0;
    var rowcpt = db.execute("UPDATE AppParams SET valueStr = '" + displayName + "' WHERE name = 'DISPLAYNAME'");
}


//////////////////////////////////////////////////////////////////////////////////
// Event listeners 
//////////////////////////////////////////////////////////////////////////////////

/**
 * Listener to handle event to determine user's location to local lakes.
 * 
 * @param {Object} e
 */
Titanium.App.addEventListener('BEST_RESOURCE_MATCH_RECD', function(e) {
	Ti.API.info('Handling event -- BEST_RESOURCE_MATCH_RECD --> ' + e);
	if (e.error) {
		currentLocation.text = 'error: ' + JSON.stringify(e.error);
		alert('error ' + JSON.stringify(e.error));
		model.setCurrentLake(null);
		return;
	}

	//
	// if the user is in a defined lake polygon
	//	
	if (e.resourceId != 0) {
		Ti.API.info('Got Lake: ' + e.resourceName + " " + e.resourceState + " ID: " + e.resourceId);
		var lake = { name: e.resourceName, state: e.resourceState, id: e.resourceId, 
			numOfLazyLakers: e.numOfLazyLakers, localCount: e.numOfLocalLakers };
		model.setCurrentLake(lake);
		Ti.App.fireEvent('LOCATION_CHANGED', {});
		var client = new RestClient();
		client.getLocalMsgEvents(e.resourceId);
	}
	else {
		Ti.API.info('*** User is not within one of our polygons ***');
		model.setCurrentLake(null);
		Ti.App.fireEvent('LOCATION_CHANGED', {});
		Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { result:[] });	
	}
});

function handleInitialUserPosition(e) {
	if (e.error) {
		currentLocation.text = 'error: ' + JSON.stringify(e.error);
		alert('error ' + JSON.stringify(e.error));
		return;
	}
	
	var lat = e.coords.latitude;
	var lng = e.coords.longitude;
	var timestamp = e.coords.timestamp;
	var accuracy = e.coords.accuracy;
	
	model.setUserLng(lng);
	model.setUserLat(lat);
	Ti.API.info('lat: ' + lat);
	Ti.API.info('lng: ' + lng);
	
	Titanium.API.info('geo - current location: ' + new Date(timestamp) + ' lng ' + lng + ' lat ' + lat + ' accuracy ' + accuracy);
	
	//
	// determine if we are inside a local lake polygon
	//
	var client = new RestClient();
	var llId = 'ABC123';
	var u = model.getCurrentUser();
	if (u != null) {
		var cipherText = Tea.encrypt(u.federatedId, model.getPW1());
		llId = cipherText;	
	}
	// hardcoding Lake Ray Roberts
	lat = 32.85;
	lng = -96.50;
	client.getBestResourceMatch(llId, lat, lng);
};

Titanium.App.addEventListener('GOOGLE_MAP_LOADED', function(e) { 
	Ti.API.info('My Google Map is loaded!!');
});

Titanium.App.addEventListener('UPDATED_PROFILE_URL', function(e) { 
	Ti.API.info('*** UPDATED_PROFILE_URL -->' + e.profileUrl);
});

Titanium.App.addEventListener('UPDATED_DISPLAY_NAME', function(e) { 
	Ti.API.info('*** UPDATED_DISPLAY_NAME -->' + e.displayName);
	model.getCurrentUser().displayName = e.displayName;
	updateDisplayName(e.displayName);
	
	if (promptDisplayNameWin != null) {
		promptDisplayNameWin.close();
		tabGroup.setActiveTab(0);
		tabGroup.open();
		//
		// start geo positioning
		//
		Titanium.Geolocation.getCurrentPosition(handleInitialUserPosition);
	}
});

Titanium.App.addEventListener('REGISTER_COMPLETE', function(e) { 
	if (registerWin != null) {
		registerWin.close();
	}
	promptDisplayNameWin = Titanium.UI.createWindow({
		title: model.getAppName(),
		color: css.getColor2(),
		font: { fontSize: 20, fontFamily: myFont },
		backgroundColor: css.getColor0(),
		barColor: css.getColor0(),
		url: 'view/promptUser4Displayname.js'
	});
	promptDisplayNameWin.model = model;
	promptDisplayNameWin.db = db;
	promptDisplayNameWin.css = css;
	promptDisplayNameWin.open();
	
});

Titanium.App.addEventListener('PROMPT_COMPLETE', function(e) { 
	Ti.API.info('registerFlag -->' + e.registerFlag);
	if (e.registerFlag) {
		registerWin = Titanium.UI.createWindow({
			title: model.getAppName(),
			color: css.getColor2(),
			font: { fontSize: 20, fontFamily: myFont },
			backgroundColor: css.getColor0(),
			barColor: css.getColor0(),
			url: 'view/registerUser.js'
		});
		registerWin.model = model;
		registerWin.db = db;
		registerWin.css = css;
		registerWin.open();
	}
	else {
		model.setCurrentUser(null);
		markUserDeclineRegistration();	
		promptWin.close();
		tabGroup.setActiveTab(0);
		tabGroup.open();
		//
		// start geo positioning
		//
		Titanium.Geolocation.getCurrentPosition(handleInitialUserPosition);
	}
});

Ti.App.addEventListener('GOTO_TAB', function(e) {
	Ti.API.info('Got gotoTab event -->' + e.nextTab);
	tabGroup.setActiveTab(e.nextTab);
});


function buildAppTabs() {
	
	////////////////////////////////////////////////////////////
	//
	// Buzz
	//
	////////////////////////////////////////////////////////////
	
	var win1 = Titanium.UI.createWindow({
		title: 'Buzz',
		color: css.getColor2(),
		font: {
			fontSize: 20,
			fontFamily: myFont
		},
		backgroundColor: css.getColor0(),
		barColor: css.getColor0(),
		url: 'view/buzzMain.js'
	});
	win1.addEventListener('focus', function(e){
		Ti.API.info('win1 is active -- ' + (e.source).url);
	});
	win1.model = model;
	win1.css = css;
	buzzTab = Titanium.UI.createTab({
		icon: 'KS_nav_ui.png',
		title: 'Buzz',
		window: win1
	});
	
	////////////////////////////////////////////////////////////
	//
	// Hotspots
	//
	////////////////////////////////////////////////////////////
	
	var win2 = Titanium.UI.createWindow({
		title: 'HotSpots',
		font: {
			fontSize: 20,
			fontFamily: myFont
		},
		backgroundColor: css.getColor0(),
		barColor: css.getColor0(),
		url: 'view/hotSpotMain.js'
	});
	win2.addEventListener('focus', function(e){
		Ti.API.info('win2 is active -- ' + (e.source).url);
	});
	win2.model = model;
	win2.css = css;
	hotspotTab = Titanium.UI.createTab({
		icon: 'KS_nav_ui.png',
		title: 'HotSpots',
		window: win2
	});
	var label2 = Titanium.UI.createLabel({
		color: '#BDBB99',
		text: 'HotSpot',
		textAlign: 'left',
		font: {
			fontSize: 20,
			fontFamily: myFont
		},
		width: 'auto'
	});
	win2.add(label2);
	
	
	////////////////////////////////////////////////////////////
	//
	// Fishing Reports
	//
	////////////////////////////////////////////////////////////
	
	var win3 = Titanium.UI.createWindow({
		title: 'Fishing Reports',
		font: {
			fontSize: 20,
			fontFamily: myFont
		},
		backgroundColor: css.getColor0(),
		barColor: css.getColor0(),
		url: 'view/reportViewer.js'
	});
	win3.addEventListener('focus', function(e){
		Ti.API.info('win3 is active -- ' + (e.source).url);
	});
	win3.model = model;
	win3.css = css;
	reportsTab = Titanium.UI.createTab({
		icon: 'KS_nav_ui.png',
		title: 'Reports',
		window: win3
	});
	var label3 = Titanium.UI.createLabel({
		color: '#BDBB99',
		text: 'Fishing Reports',
		font: {
			fontSize: 20,
			fontFamily: 'Verdana'
		},
		textAlign: 'center',
		width: 'auto'
	});
	win3.add(label3);
	
	
	////////////////////////////////////////////////////////////
	//
	// Settings
	//
	////////////////////////////////////////////////////////////
	
	var win4 = Titanium.UI.createWindow({
		title: 'Settings',
		font: {
			fontSize: 20,
			fontFamily: myFont
		},
		backgroundColor: css.getColor2(),
		barColor: css.getColor0(),
		url: 'view/settingsMain.js'
	});
	win4.addEventListener('focus', function(e){
		Ti.API.info('win4 is active -- ' + (e.source).url);
	});
	win4.model = model;
	win4.css = css;
	settingsTab = Titanium.UI.createTab({
		icon: 'KS_nav_platform.png',
		title: 'Settings',
		window: win4
	});
};

//
// application init
//
function init() {
	
	// reset db
	db.execute("DELETE FROM AppParams WHERE name = 'DECLINE_REGISTRATION'");

	//
	// set personal device id
	//
	var anonymousUserId = 'MY_DEVICE_ID' + '=' + Titanium.Platform.id;
	var cipherText = Tea.encrypt(anonymousUserId, model.getAnonymousPassword());
	model.setDeviceId(cipherText);
	
	//
	// build init UI
	//
	buildAppTabs();
	tabGroup = Titanium.UI.createTabGroup();
	tabGroup.addTab(buzzTab);
	tabGroup.addTab(hotspotTab);
	tabGroup.addTab(reportsTab);
	tabGroup.addTab(settingsTab);
	
	//
	// check if user has registered as an user of the app
	//
 	if (hasUserRegistered()) {
		//
		// load registration from DB
		//
		loadRegistration();
		//
		// open tab group
		//
		tabGroup.setActiveTab(0);
		tabGroup.open();
		//
		// start geo positioning
		//
		Titanium.Geolocation.getCurrentPosition(handleInitialUserPosition);
	}
	else {
		if (!hasUserDeclined()) {
			promptWin = Titanium.UI.createWindow({
				title: model.getAppName(),
				color: css.getColor2(),
				font: { fontSize: 20, fontFamily: myFont },
				backgroundColor: css.getColor0(),
				barColor: css.getColor0(),
				url: 'view/promptUserToRegister.js'
				// url: 'view/promptUser4Displayname.js'
			});
			promptWin.model = model;
			promptWin.db = db;
			promptWin.css = css;
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
			Titanium.Geolocation.getCurrentPosition(handleInitialUserPosition);
		}
	}
	
};

init();

