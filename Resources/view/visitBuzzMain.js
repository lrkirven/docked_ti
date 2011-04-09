Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../props/cssMgr.js');
Ti.include('../util/tools.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var hotSpot = win.hotSpot;
var canEdit = win.canEdit;
var windowList = [];
var selectedLake = null;
var selectedMenu = null;
var menu0 = null;
var userCountLbl = null;
var mainInd = null;
var userLabel = null;
var currentWin = null;


Titanium.App.addEventListener('RESET_MY_HOTSPOTS', function(e) { 
	hotSpot = e.hotSpot;
});

/**
 * This method build the table that contains all of the buzz messages.
 */
function buildSearchOptionMenu() {
	// table header
	var tblHeader = Ti.UI.createView({ height:30, width:'auto' });
	var label = Ti.UI.createLabel({ 
		top:5,
		left:10,
   		text:Msgs.VISIT_OPTIONS,
		font: { fontFamily:model.myFont, fontSize:20, fontWeight:'bold' },
		color:CSSMgr.color2
	});
	tblHeader.add(label);
	// create table view
	selectedMenu = Titanium.UI.createTableView({
		top:0,
		headerView:tblHeader,
		scrollable:false,
		moving:false,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		rowBackgroundColor:CSSMgr.color2
	});

	// create table view event listener
	selectedMenu.addEventListener('click', function(e) {
		Ti.API.info('User selcted to go here: ' + e.rowData.ptr);
		if (e.rowData.ptr) {
			currentWin = Titanium.UI.createWindow({
				url:e.rowData.ptr,
				backgroundColor:CSSMgr.color0,
    			barColor:CSSMgr.color0,
				barImage: '../images/Header.png',
				remoteOption:e.rowData.remoteOption,
				model:model
			});
			Titanium.UI.currentTab.open(currentWin, {animated:true});
		}
	});
	win.add(selectedMenu);	
	selectedMenu.backgroundImage = '../images/Background.png';
};

/**
 * This method initializes the buzz main menu for user selections.
 */
function init() {
	
	/*
 	 * Modify the 'Back' button
 	 */
	Base.attachMyBACKButton(win);
	
	menu0 = [{
		title: 'Search...',
		leftImage: '../images/ChatBubble.png',
		hasChild: true,
		localFlag: false,
		remoteOption: 0,
		ptr: 'buzzViewer.js'
	}, {
		title: 'Show Closest',
		hasChild: true,
		leftImage: '../images/ChatBubble.png',
		remoteOption: 1,
		ptr: 'buzzViewer.js'
	}];
	
	Ti.API.info('hotSpotSelectedMain.init(): Entered ');
	
	/*
	 * Buzz message table
	 */
	buildSearchOptionMenu();
	selectedMenu.data = menu0;
	
	/*
	 * iAd integration
	 */
	Base.attachiAd(win);
	
};

init();
