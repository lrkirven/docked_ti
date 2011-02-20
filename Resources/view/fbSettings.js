Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/tools.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var db = win.db;
var switchBtn0 = null;
var switchBtn1 = null;
var tempFlag = false;
var initFlag = true;

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


//////////////////////////////////////////////////////////////////////////////////
// Event listeners 
//////////////////////////////////////////////////////////////////////////////////

/**
 * Listener to handle event to determine user's location to local lakes.
 * 
 * @param {Object} e
 */
Titanium.App.addEventListener('UPDATED_PROFILE_URL', function(e) {
	Ti.API.info('Got UPDATED_PROFILE_URL event ...');
	model.setUseFBProfilePic(tempFlag);
	dbUpdateUseFbProfilePic(tempFlag);
});


function getMyFacebookInfo() {
	var query = "SELECT uid, name, pic_square, status FROM user where uid = " + Titanium.Facebook.getUserId() ;
	Ti.API.info('user id ' + Titanium.Facebook.getUserId());
	Titanium.Facebook.query(query, function(r) {
		var data = [];
		if (r.data.length > 0) {
			var info = r.data[0];	
			if (info.pic_square != null) {
				Ti.API.info('fb profile url ---> ' + info.pic_square);
				model.setFBProfileUrl(info.pic_square);
				dbUpdateFbProfilePic(info.pic_square);
			}
			if (info.status != null && info.status.message != null) {
				Ti.API.info('fb status ---> ' + info.status.message);
				model.setFBStatus(info.status.message);
			}
			else {
				Ti.API.info('fb status ---> EMPTY');
				model.setFBStatus(null);
			}
		}
	});	
};

function buildForm() {

	// var fbFlag = Titanium.Facebook.isLoggedIn();
	var fbFlag = true;
	
	Ti.API.info('fbFlag --> ' + fbFlag);
	
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
	
	var defaultIDImage = Base.createProfilePic(10, 10);
	panel.add(defaultIDImage);
	
	var fbLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Click button below to connect to your Facebook account: ',
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight:'bold' },
		top: 70,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(fbLbl);
	
	//
	// Facebook Login Button
	//
	var fbButton = Titanium.Facebook.createLoginButton({
		'style': 'wide',
		'apikey': model.getFBAPIKey(),
		'secret': model.getFBSecret(),
		top: 120,
		left: 0,
		height: 30,
		width: 200
	});
	panel.add(fbButton);
	
	fbButton.addEventListener('login', function(){
		Ti.API.info('Logged In = ' + Titanium.Facebook.isLoggedIn());
		var flag = Titanium.Facebook.isLoggedIn();
		switchBtn0.enabled = flag;
		switchBtn1.enabled = flag;
		model.setSync2Fb(false);
		dbUpdateSync2Fb(false);
		model.setUseFBProfilePic(false);
		dbUpdateUseFbProfilePic(false);
		getMyFacebookInfo();
	});
	
	fbButton.addEventListener('logout', function(){
		Ti.API.info('Logged In = ' + Titanium.Facebook.isLoggedIn());
		var flag = Titanium.Facebook.isLoggedIn();
		switchBtn0.enabled = flag;
		switchBtn1.enabled = flag;
	});
	
	var lbl0 = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Use Facebook Profile Picture: ',
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight:'bold' },
		top: 170,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl0);
	
	var useFbFlag = model.getUseFBProfilePic();
	Ti.API.info('useFbFlag = ' + useFbFlag);
	switchBtn0 = Titanium.UI.createSwitch({
		value: useFbFlag,
		top: 195,
		left: 10,
		enabled: fbFlag
	});
	switchBtn0.value = useFbFlag;
	switchBtn0.addEventListener('change', function(e) {
		if (!initFlag) {
			Ti.API.info('Use FB Profile Pic? ' + e.value);
			var client = new RestClient();
			var user = model.getCurrentUser();
			Ti.API.info('Current FBprofileURL --> ' + model.getFBProfileUrl());
			if (model.getFBProfileUrl() != null) {
				if (e.value) {
					client.updateProfileUrl(user.id, model.getFBProfileUrl());
				}
				else {
					client.updateProfileUrl(user.id, 'NULL');
				}
				tempFlag = e.value;
			}
			else {
				Tools.reportMsg(Msgs.APP_NAME, 'Please login into Facebook to synchronize your profile');	
			}
		}
	});
	panel.add(switchBtn0);
	
	var lbl1 = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Sync Docked Buzz to Facebook: ',
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight:'bold' },
		top: 240,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl1);
	
	var sync2Fb = model.getSync2Fb(); 
	Ti.API.info('sync2Fb = ' + useFbFlag);
	switchBtn1 = Titanium.UI.createSwitch({
		value:sync2Fb,
		top: 265,
		left: 10,
		enabled: fbFlag
	});
	switchBtn1.addEventListener('change', function(e) {
		if (!initFlag) {
			Ti.API.info('Sync Docked Buzz to FB? ' + e.value);
			model.setSync2Fb(e.value);
			dbUpdateSync2Fb(e.value);
		}
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
