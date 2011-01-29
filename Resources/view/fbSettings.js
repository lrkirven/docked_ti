Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;
var switchBtn0 = null;
var switchBtn1 = null;

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

function dbUpdateSync2Fb(flag) {
	var count = 0;
    var rowcpt = 0;
	if (flag) {
		rowcpt = db.execute("UPDATE AppParams SET valueInt = 1 WHERE name = 'SYNC_TO_FB'");
	}
	else {
		rowcpt = db.execute("UPDATE AppParams SET valueInt = 0 WHERE name = 'SYNC_TO_FB'");
	}
};

function dbUpdateUseFbProfilePic(flag) {
	var count = 0;
    var rowcpt = 0;
	if (flag) {
		rowcpt = db.execute("UPDATE AppParams SET valueInt = 1 WHERE name = 'USE_FB_PIC'");
	}
	else {
		rowcpt = db.execute("UPDATE AppParams SET valueInt = 0 WHERE name = 'USE_FB_PIC'");
	}
};

function buildForm() {

	var fbFlag = Titanium.Facebook.isLoggedIn();
	
	var defaultIDImage = Ti.UI.createImageView({
		image: '../user.png',
		backgroundColor:css.getColor0(),
		borderColor:css.getColor2(),
		top:10,
		left:20,
		width:50,
		height:50,
		clickName:'defaultIDImage'
	});
	win.add(defaultIDImage);
	
	var panel = Ti.UI.createView({
		backgroundColor: '#cccccc',
		top: 70,
		left: 10,
		width: 300,
		height: 350,
		borderRadius: 20,
		clickName: 'bg'
	});
	
	var fbLbl = Titanium.UI.createLabel({
		color: css.getColor0(),
		text: 'Click button below to connect to your Facebook account: ',
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight:'bold' },
		top: 0,
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
		top: 50,
		left: 0,
		height: 30,
		width: 200
	});
	panel.add(fbButton);
	
	fbButton.addEventListener('login', function(){
		// label.text = 'Logged In = ' + Titanium.Facebook.isLoggedIn();
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
		// label.text = 'Logged In = ' + Titanium.Facebook.isLoggedIn();	
		var flag = Titanium.Facebook.isLoggedIn();
		switchBtn0.enabled = flag;
		switchBtn1.enabled = flag;
	});
	
	var lbl0 = Titanium.UI.createLabel({
		color: css.getColor0(),
		text: 'Use Facebook Profile Picture: ',
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight:'bold' },
		top: 100,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl0);
	
	switchBtn0 = Titanium.UI.createSwitch({
		value: false,
		top: 125,
		left: 10,
		enabled: fbFlag
	});
	switchBtn0.addEventListener('change', function(e) {
		model.setUseFBProfilePic(e.value);
		dbUpdateUseFbProfilePic(e.value);
		Ti.API.info('-------------------> Posting to Facebook? ' + e.value);
	});
	panel.add(switchBtn0);
	
	var lbl1 = Titanium.UI.createLabel({
		color: css.getColor0(),
		text: 'Sync Docked Buzz to Facebook: ',
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight:'bold' },
		top: 170,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl1);
	
	switchBtn1 = Titanium.UI.createSwitch({
		value: false,
		top: 198,
		left: 10,
		enabled: fbFlag
	});
	switchBtn1.addEventListener('change', function(e) {
		model.setSync2Fb(e.value);
		dbUpdateSync2Fb(e.value);
		Ti.API.info('-------------------> Sync Docked Buzz to FB? ' + e.value);
	});
	panel.add(switchBtn1);
	
	win.add(panel);
};

function init() {
	buildForm();	
};


init();
