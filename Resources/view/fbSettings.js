Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/tools.js');
Ti.include('../util/fbAuth.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');
Ti.include('../client/fbClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var db = win.db;
var switchBtn0 = null;
var switchBtn1 = null;
var tempFlag = false;
var initFlag = true;
var fbFlag = false;
var fbProfileFlag = false;

//////////////////////////////////////////////////////////////////////////////////
// DB related methods
//////////////////////////////////////////////////////////////////////////////////

function dbUpdateSync2Fb(flag) {
	var count = 0;
    var rowcpt = 0;
	db.rowsAffected = 0;
	if (flag) {
		db.execute("UPDATE AppParams SET valueInt = 1 WHERE name = 'SYNC_TO_FB'");
	}
	else {
		db.execute("UPDATE AppParams SET valueInt = 0 WHERE name = 'SYNC_TO_FB'");
	}
	if (db.rowsAffected == 0) {
		Ti.API.error('dbUpdateSync2Fb(): FAILED');	
	}
	else {
		Ti.API.info('dbUpdateSync2Fb(): SUCCESS');	
	}
};

function dbInsertFacebookAccessToken(token) {
	var count = 0;
    var rowcpt = 0;
	db.rowsAffected = 0;
	db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('FB_ACCESS_TOKEN', '" + token + "', 0)");
};

function dbDeleteFacebookAccessToken() {
	db.execute("DELETE FROM AppParams WHERE name = 'FB_ACCESS_TOKEN'");	
};

function dbUpdateUseFbProfilePic(flag) {
	var count = 0;
    var rowcpt = 0;
	db.rowsAffected = 0;
	if (flag) {
		db.execute("UPDATE AppParams SET valueInt = 1 WHERE name = 'USE_FB_PIC'");
	}
	else {
		db.execute("UPDATE AppParams SET valueInt = 0 WHERE name = 'USE_FB_PIC'");
	}
	if (db.rowsAffected == 0) {
		Ti.API.error('dbUpdateUseFbProfilePic(): FAILED');	
	}
	else {
		Ti.API.info('dbUpdateUseFbProfilePic(): SUCCESS');	
	}
};

function dbUpdateFbProfilePic(url) {
	var count = 0;
    var rowcpt = 0;
	db.rowsAffected = 0;
	db.execute("UPDATE AppParams SET valueStr='" + url + "' WHERE name = 'FB_PROFILE_PIC'");
	if (db.rowsAffected == 0) {
		Ti.API.error('dbUpdateUseFbProfilePic(): FAILED');	
	}
	else {
		Ti.API.info('dbUpdateUseFbProfilePic(): SUCCESS');	
	}
};

function connect2Facebook(bConnect) {
	Ti.API.info('connect2Facebook(): bConnect=' + bConnect);
	if (bConnect) {
		var fbApiKey = model.getFBAPIKey();
		var cachedToken = model.getFbAccessToken();
		Ti.API.info('connect2Facebook(): cachedToken --> ' + cachedToken);
		if (cachedToken == null) {
			fbAuthModule.init(fbApiKey, 'publish_stream,user_photos,offline_access');
			fbAuthModule.login(function(data){
				Ti.API.info('Got success date ' + JSON.stringify(data));
				Ti.API.info('Got access token ' + fbAuthModule.ACCESS_TOKEN);
				model.setFbAccessToken(fbAuthModule.ACCESS_TOKEN);
				dbInsertFacebookAccessToken(fbAuthModule.ACCESS_TOKEN);
				fbFlag = true;
			});
		}
		else {
			Ti.API.info('Found previously cached access token ---> ' + cachedToken);
			fbFlag = true;
		}
	}
	else {
		Ti.API.info('Removing local facebook access token!!');
		dbDeleteFacebookAccessToken();
		fbAuthModule.logout(null);
		fbFlag = false;
	}
};


//////////////////////////////////////////////////////////////////////////////////
// Event listeners 
//////////////////////////////////////////////////////////////////////////////////

/*
fbAuthModule.init("YOUR CLIENT ID","publish_stream,user_hometown,user_photos");
fbAuthModule.login(function(data) {
    Ti.API.debug('success date ' + JSON.stringify(data));
    Ti.API.debug('access token ' + fbAuthModule.ACCESS_TOKEN);
});
*/


/**
 * Listener to handle event to determine user's location to local lakes.
 * 
 * @param {Object} e
 */
Titanium.App.addEventListener('UPDATED_PROFILE_URL', function(e) {
	if (e.profileUrl != null) {
		Ti.API.info('Got UPDATED_PROFILE_URL event ... new profile url --> ' + e.profileUrl);
		model.setFBProfileUrl(e.profileUrl);
		dbUpdateFbProfilePic(e.profileUrl);
	}
	else {
		Ti.API.info('Got UPDATED_PROFILE_URL event ... Removing existing profile url');
		model.setFBProfileUrl(null);
		dbUpdateUseFbProfilePic(false);
	}
});

Titanium.App.addEventListener('FB_USER_PROFILE_RECD', function(e) {
	Ti.API.info('Got FB PROFILE URL ...');
	if (e.tag == 'profileUrl') {
		var fbId = e.result.id;
		var profileUrl = e.fbBaseUrl + '/' + fbId + '/' + 'picture';
		Ti.API.info('CONSTRUCTED FB PROFILE URL --> ' + profileUrl);
		model.setUseFBProfilePic(true);
		dbUpdateUseFbProfilePic(true);
		fbProfileFlag = true;
		var client = new RestClient();
		var user = model.getCurrentUser();
		client.updateProfileUrl(user.id, profileUrl);
	}
});


function buildForm() {

	var savedToken = model.getFbAccessToken();
	if (savedToken != null) {
		fbFlag = true;
	}
	
	Ti.API.info('Using Facebook flag --> ' + fbFlag);
	
	var panel = Ti.UI.createView({
		backgroundColor: CSSMgr.color2,
		top: 15,
		bottom: 15,
		left: 10,
		width: 300,
		borderColor:CSSMgr.color0,
		borderRadius: 20,
		clickName: 'bg'
	});
	
	var icon = Base.createIcon(15, 15);
	panel.add(icon);
	
	var fbLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Connect to your facebook account: ',
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight:'bold' },
		top: 70,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(fbLbl);

	var fbApiKey = model.getFBAPIKey();
	var fbSecret = model.getFBSecret();		
	
	var fbSwitch = Titanium.UI.createSwitch({
		value: fbFlag,
		top: 95,
		left: 10,
		enabled: true
	});
	fbSwitch.addEventListener('change', function(e) {
		if (e.value) {
			switchBtn0.enabled = true;
			switchBtn1.enabled = true;
			model.setSync2Fb(false);
			dbUpdateSync2Fb(false);
			model.setUseFBProfilePic(false);
			dbUpdateUseFbProfilePic(false);
			connect2Facebook(true);
		}
		else {
			model.setSync2Fb(false);
			dbUpdateSync2Fb(false);
			model.setUseFBProfilePic(false);
			dbUpdateUseFbProfilePic(false);
			switchBtn0.enabled = false;
			switchBtn1.enabled = false;
			connect2Facebook(false);
		}
	});
	panel.add(fbSwitch);
	
	var lbl0 = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Use facebook profile picture: ',
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight:'bold' },
		top: 135,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl0);
	
	fbProfileFlag = model.getUseFBProfilePic();
	Ti.API.info('[BEFORE] UseFBProfilePic flag=' + fbProfileFlag);
	switchBtn0 = Titanium.UI.createSwitch({
		value: fbProfileFlag,
		top: 160,
		left: 10,
		enabled: fbFlag
	});
	switchBtn0.addEventListener('change', function(e) {
		if (!initFlag) {
			Ti.API.info('Use FB Profile Pic? ' + e.value + ' [current] UseFBProfilePic flag=' + fbProfileFlag);
			if (e.value) {
				if (!fbProfileFlag) {
					var fbClient = new FacebookClient();
					var token = model.getFbAccessToken();
					fbClient.setAccessToken(token);
					fbClient.getUserProfile('profileUrl');
				}
			}
			else {
				if (fbProfileFlag) {
					Ti.API.info('Setting Use FB profile pic to false !@#!@#!@#!@#!@#!@#');
					fbProfileFlag = false;
					var client = new RestClient();
					var user = model.getCurrentUser();
					client.updateProfileUrl(user.id, 'NULL');
				}
			}
		}
	});
	panel.add(switchBtn0);
	
	var lbl1 = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Post your Docked Buzz to facebook: ',
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight:'bold' },
		top: 200,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl1);
	
	var sync2Fb = model.getSync2Fb(); 
	Ti.API.info('sync2Fb = ' + sync2Fb);
	switchBtn1 = Titanium.UI.createSwitch({
		value:sync2Fb,
		top: 225,
		left: 10,
		enabled: fbFlag
	});
	switchBtn1.addEventListener('change', function(e) {
		Ti.API.info('Sync Docked Buzz to FB? ' + e.value);
		model.setSync2Fb(e.value);
		dbUpdateSync2Fb(e.value);
	});
	panel.add(switchBtn1);
	
	win.add(panel);
	win.backgroundImage = '../images/Background.png';
};

function init() {
	buildForm();
	initFlag = false;	
};


init();
