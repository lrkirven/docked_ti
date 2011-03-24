Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../props/cssMgr.js');
Ti.include('../util/tools.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var windowList = [];
var selectedLake = null;
var buzzMenu = null;
var inPolygonMM = null;
var outPolygonMM = null;
var inPolygonAnonymousMM = null;
var userCountLbl = null;
var mainInd = null;


/**
 * This method goes to server to check for Buzz messages in your current lake zone.
 */
function check4NewMsgEvents() {
	var client = new RestClient();
	var activeLake = model.getCurrentLake();
	if (activeLake != null) {
		Ti.API.info('check4MsgEvent(): resKey ---> ' + activeLake.resKey);
		client.getLocalMsgEvents(activeLake.resKey);
	}
	else {
		Ti.API.info('check4MsgEvent(): Not in a region to view messages!!!!');
		Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { result:[], status:0 });
	}
};

/**
 * Handles PING response from service.
 * 
 * @param {Object} e
 */
Titanium.App.addEventListener('PING_RESPONSE_DATA', function(e) { 
	if (e.status > 0) {
		mainInd.hide();
	}
});

Titanium.App.addEventListener('UPDATED_DISPLAY_NAME', function(e) { 
	if (e.status == 0) {
		/*
		 * trying access user label
		 */
		if (headerView.children[2] != null) {
			headerView.children[2].text = e.displayName;
		}
	}
});

Titanium.App.addEventListener('LOCATION_CHANGED', function(e){
	Ti.API.info('Handle LOCATION_CHANGED event ...');
	if (model.getCurrentLake() != null) {
		selectedLake.text = model.getCurrentLake().name;
		selectedLake.color = CSSMgr.color4;
		buzzMenu.data = (model.getCurrentUser() == null ? inPolygonAnonymousMM : inPolygonMM);
		var countDisplay = model.getCurrentLake().localCount + Msgs.USERS;
		userCountLbl.text = countDisplay;
		win.touchEnabled = true;
	}
	else {
		selectedLake.text = Msgs.OUT_OF_ZONE;
		userCountLbl.text = '';
		selectedLake.color = CSSMgr.color3;
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
	var tblHeader = Ti.UI.createView({ height:30, width:'auto' });
	var label = Ti.UI.createLabel({ 
		top:5,
		left:10,
   		text:Msgs.BUZZ_TITLE, 
		font: { fontFamily:model.myFont, fontSize:20, fontWeight:'bold' },
		color:CSSMgr.color2
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
		rowBackgroundColor:CSSMgr.color2
	});

	// create table view event listener
	buzzMenu.addEventListener('click', function(e) {
		Ti.API.info('User selcted to go here: ' + e.rowData.ptr);
		if (e.rowData.ptr) {
			var w = Titanium.UI.createWindow({
				url:e.rowData.ptr,
				backgroundColor:CSSMgr.color0,
    			barColor:CSSMgr.color0,
				barImage: '../images/Header.png',
				localFlag:e.rowData.localFlag
			});
			w.model = model;
			Titanium.UI.currentTab.open(w, {animated:true});
			windowList.push(w);
		}
	});
	win.add(buzzMenu);	
	buzzMenu.backgroundImage = '../images/Background.png';
};

/**
 * This method initializes the buzz main menu for user selections.
 */
function init() {
	
	win.touchEnabled = false;
	
	inPolygonMM = [{
		title: 'Browse',
		hasChild: true,
		leftImage: '../images/ChatBubble.png',
		localFlag: true,
		ptr: 'buzzViewer.js'
	}, {
		title: 'Map',
		hasChild: true,
		leftImage: '../images/ChatBubble.png',
		ptr: 'buzzOnMapViewer.js'
	}, {
		title: 'Post',
		hasChild: true,
		leftImage: '../images/ChatBubble.png',
		ptr: 'composeMsg.js'
	}, {
		title: 'Visit',
		hasChild: true,
		leftImage: '../images/ChatBubble.png',
		localFlag: false,
		ptr: 'visitBuzzMain.js'
	}];
	
	inPolygonAnonymousMM = [{
		title: 'Browse',
		hasChild: true,
		leftImage: '../images/ChatBubble.png',
		localFlag: true,
		ptr: 'buzzViewer.js'
	}, {
		title: 'Map',
		hasChild: true,
		leftImage: '../images/ChatBubble.png',
		localFlag: false,
		ptr: 'buzzOnMapViewer.js'
	}, {
		title: 'Visit',
		hasChild: true,
		localFlag: false,
		leftImage: '../images/ChatBubble.png',
		ptr: 'buzzViewer.js'
	}];
	
	outPolygonMM = [{
		title: 'Visit',
		hasChild: true,
		localFlag: false,
		leftImage: '../images/ChatBubble.png',
		ptr: 'visitBuzzMain.js'
	}];
	
	Ti.API.info('buzzMain.init(): Entered ');
	
	/*
	 * header
	 */	
	headerView = Base.buildLocationHeader(win, true, '');
	
	/*
	var exitBtn = Titanium.UI.createButton({
		backgroundImage:'../images/Exit.png',
		font: { fontFamily:model.myFont, fontSize:20, fontWeight:'bold' },
		style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		enabled: true,
		bottom: 20,
		right: 10,
		height: 30,
		width: 30
	});
	exitBtn.addEventListener('click', function(e) {
		Ti.App.fireEvent('EXIT_APP', {});
	});
	win.setRightNavButton(exitBtn);
	*/

	/*
	 * Buzz message table
	 */
	buildBuzzMsgTable();
	
	/*
	 * iAd integration
	 */
	Base.attachiAd(win);
	
	mainInd = Base.showPreloader(win, 'Initializing ...', false);
	
	setTimeout(function () { 
		Ti.App.fireEvent('LOCATION_CHANGED', {});	
    }, 25000);
	
	
};

init();
