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
	win.close();
});

/**
 * This method build the table that contains all of the buzz messages.
 */
function buildSelectedHotSpotTable() {
	// table header
	var tblHeader = Ti.UI.createView({ height:30, width:'auto' });
	var label = Ti.UI.createLabel({ 
		top:5,
		left:10,
   		text:Msgs.HOTSPOT_OPTIONS,
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
				barImage: '../Header.png',
				hotSpot:hotSpot,
				canEdit:canEdit,
				model:model
			});
			Titanium.UI.currentTab.open(currentWin, {animated:true});
		}
	});
	win.add(selectedMenu);	
	selectedMenu.backgroundImage = '../dockedbg.png';
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
		title: 'Info',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		localFlag: true,
		ptr: 'hotSpotEditor.js'
	}, {
		title: 'Map',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'hotSpotOnMapViewer.js'
	}, {
		title: 'Compass',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'showCompass.js'
	}];
	
	Ti.API.info('hotSpotSelectedMain.init(): Entered ');
	
	/*
	 * Buzz message table
	 */
	buildSelectedHotSpotTable();
	selectedMenu.data = menu0;
	
	/*
	 * iAd integration
	 */
	Base.attachiAd(win);
	
};

init();
