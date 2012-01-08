Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/tools.js');
Ti.include('../util/fbAuth.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');
Ti.include('../lib/birdhouse.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var db = win.db;
var switchBtn1 = null;
var tempFlag = false;
var initFlag = true;
var fbBaseUrl = 'https://graph.facebook.com';


var BH = new BirdHouse({
	consumer_key:'G8wMSEckfzvbbOklMpniA',
	consumer_secret:'AvZXdkZIW42WrJrWHGkzWPmmzyTMVbZskOg9nJbvc',
	callback_url: 'http://www.docked.co'
});

var twFlag = BH.authorized;

//////////////////////////////////////////////////////////////////////////////////
// DB related methods
//////////////////////////////////////////////////////////////////////////////////

function dbUpdateSync2Tw(flag) {
	var count = 0;
    var rowcpt = 0;
	db.rowsAffected = 0;
	if (flag) {
		db.execute("UPDATE AppParams SET valueInt = 1 WHERE name = 'SYNC_TO_TW'");
	}
	else {
		db.execute("UPDATE AppParams SET valueInt = 0 WHERE name = 'SYNC_TO_TW'");
	}
	if (db.rowsAffected == 0) {
		Ti.API.error('dbUpdateSync2Tw(): FAILED');	
	}
	else {
		Ti.API.info('dbUpdateSync2Tw(): SUCCESS');	
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


//////////////////////////////////////////////////////////////////////////////////
// Event listeners 
//////////////////////////////////////////////////////////////////////////////////

function buildForm() {

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
	
	/*
	var twLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Connect to your Twitter account: ',
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight:'bold' },
		top: 70,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(twLbl);

	var twSwitch = Titanium.UI.createSwitch({
		value: twFlag,
		top: 95,
		left: 10,
		enabled: true
	});
	twSwitch.addEventListener('change', function(e) {
		if (e.value) {
			model.setSync2Tw(false);
			dbUpdateSync2Tw(false);
			BH.authorize(function (e){
				var alertDialog = Titanium.UI.createAlertDialog({
					buttonNames: ['OK']
				});
				if (e===true) {
					alertDialog.message = 'Successfully authorized.';
					
					switchBtn1.enabled = true;
				} 
				else {
					alertDialog.message = 'Failed to authorize.';
					switchBtn1.enabled = false;
				}
				alertDialog.show();
			});
		}
		else {
			model.setSync2Tw(false);
			dbUpdateSync2Tw(false);
			switchBtn1.enabled = false;
		}
	});
	panel.add(twSwitch);
	*/
	
	var lbl1 = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Post your Docked Buzz to Twitter: ',
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight:'bold' },
		top: 70,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl1);
	
	var sync2Tw = model.getSync2Tw(); 
	Ti.API.info('sync2Tw = ' + sync2Tw);
	switchBtn1 = Titanium.UI.createSwitch({
		value:sync2Tw,
		top: 95,
		left: 10,
		enabled: true
	});
	switchBtn1.addEventListener('change', function(e) {
		Ti.API.info('Sync Docked Buzz to Twitter? ' + e.value);
		model.setSync2Tw(e.value);
		dbUpdateSync2Tw(e.value);
	});
	panel.add(switchBtn1);
	
	win.add(panel);
	win.backgroundImage = '../images/Background.png';
};

function init() {
	buildForm();
	initFlag = false;	
};

//
// intitial entry
//
init();
