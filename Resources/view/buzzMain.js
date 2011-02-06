Ti.include('../util/msgs.js');
Ti.include('../util/tools.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;
var windowList = [];
var selectedLake = null;
var buzzMenu = null;
var inPolygonMM = null;
var outPolygonMM = null;
var userCountLbl = null;
var mainInd = null;
var userLabel = null;


/**
 * This method goes to server to check for Buzz messages in your current lake zone.
 */
function check4NewMsgEvents() {
	var client = new RestClient();
	var activeLake = model.getCurrentLake();
	if (activeLake != null) {
		Ti.API.info('check4MsgEvent(): resourceId ---> ' + activeLake.id);
		client.getLocalMsgEvents(activeLake.id);
	}
	else {
		Ti.API.info('check4MsgEvent(): Not in a region to view messages!!!!');
		Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { result:[], status:0 });
	}
};

/**
 * This method goes to Facebook to get your profile pic and other facebook information of 
 * logged in user.
 */
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

Titanium.App.addEventListener('PING_RESPONSE_DATA', function(e) { 
	if (e.status > 0) {
		mainInd.hide();
	}
});

Titanium.App.addEventListener('UPDATED_DISPLAY_NAME', function(e) { 
	if (e.status == 0) {
		userLabel.text = e.displayName;
	}
});

Titanium.App.addEventListener('LOCATION_CHANGED', function(e){
	Ti.API.info('Handle LOCATION_CHANGED event ...');
	if (model.getCurrentLake() != null) {
		selectedLake.text = model.getCurrentLake().name;
		selectedLake.color = css.getColor4();
		buzzMenu.data = (model.getCurrentUser() == null ? inPolygonAnonymousMM : inPolygonMM);
		var countDisplay = model.getCurrentLake().localCount + Msgs.USERS;
		userCountLbl.text = countDisplay;
		win.touchEnabled = true;
	}
	else {
		selectedLake.text = Msgs.OUT_OF_ZONE;
		userCountLbl.text = '';
		selectedLake.color = css.getColor3();
		buzzMenu.data = outPolygonMM;
		win.touchEnabled = true;
	}
	mainInd.hide();
});

/**
 * This method build the table that contains all of the buzz messages.
 */
function buildBuzzMsgTable() {
	// table header
	var tblHeader = Ti.UI.createView({ height:30, width:320 });
	var label = Ti.UI.createLabel({ 
		top:5,
		left:10,
   		text:Msgs.BUZZ_TITLE, 
		font: { fontFamily:model.myFont, fontSize:20, fontWeight:'bold' },
		color:css.getColor2()
	});
	tblHeader.add(label);
	// create table view
	buzzMenu = Titanium.UI.createTableView({
		top:45,
		headerView:tblHeader,
		scrollable:false,
		moving:false,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		rowBackgroundColor:css.getColor2()
	});

	// create table view event listener
	buzzMenu.addEventListener('click', function(e) {
		Ti.API.info('User selcted to go here: ' + e.rowData.ptr);
		if (e.rowData.ptr) {
			var w = Titanium.UI.createWindow({
				url:e.rowData.ptr,
				backgroundColor:css.getColor0(),
    			barColor:css.getColor0(),
				title:Msgs.APP_NAME,
				localFlag:e.rowData.localFlag
			});
			w.model = model;
			w.css = css;
			Titanium.UI.currentTab.open(w, {animated:true});
			windowList.push(w);
		}
	});
	win.add(buzzMenu);	
	buzzMenu.backgroundImage = '../dockedbg.png';
};

/**
 * This method initializes the buzz main menu for user selections.
 */
function init() {
	
	win.touchEnabled = false;
	
	inPolygonMM = [{
		title: 'Browse',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		localFlag: true,
		ptr: 'messageViewer.js'
	}, {
		title: 'Map',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'buzzOnMapViewer.js'
	}, {
		title: 'Post',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'composeMsg.js'
	}, {
		title: 'Visit other Lakers',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		localFlag: false,
		// ptr: 'remoteViewer.js'
		ptr: 'messageViewer.js'
	}];
	
	inPolygonAnonymousMM = [{
		title: 'Browse',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		localFlag: true,
		ptr: 'messageViewer.js'
	}, {
		title: 'Map',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'buzzOnMapViewer.js'
	}, {
		title: 'Visit other Lakers',
		hasChild: true,
		localFlag: false,
		leftImage: '../phone_playmovie.png',
		// ptr: 'remoteViewer.js'
		ptr: 'messageViewer.js'
	}];
	
	outPolygonMM = [{
		title: 'Visit other lakes',
		hasChild: true,
		localFlag: false,
		leftImage: '../phone_playmovie.png',
		// ptr: 'remoteViewer.js'
		ptr: 'messageViewer.js'
	}];
	
	Ti.API.info('buzzMain.init(): Entered ');
	
	/*
	 * header
	 */	
	headerView = Base.buildLocationHeader(win, true, '');

	/*
	 * Buzz message table
	 */
	buildBuzzMsgTable();
	
	/*
	 * iAd integration
	 */
	Base.attachiAd(win);
	
	if (Titanium.Facebook.isLoggedIn()) {
		getMyFacebookInfo();
	}
	
	mainInd = Base.showPreloader(win, 'Initializing ...');
	
	setTimeout(function () { 
		Ti.App.fireEvent('LOCATION_CHANGED', {});	
    }, 20000);
};

init();
