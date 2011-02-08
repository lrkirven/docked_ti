Ti.include('../util/tools.js');
Ti.include('../util/msgs.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var windowList = [];
var buzzMenu = null;
var inPolygonMM = null;
var outPolygonMM = null;
var userCountLbl = null;
var mainInd = null;
var userLabel = null;
var hsMenu = null;
var selectedLake = null;

/**
 * Handle event that the user's location has changed.
 * @param {Object} e
 */
Titanium.App.addEventListener('LOCATION_CHANGED', function(e){
	Ti.API.info('Handle LOCATION_CHANGED event ...');
	if (model.getCurrentLake() != null) {
		selectedLake.text = model.getCurrentLake().name;
		selectedLake.color = CSSMgr.color4;
		hsMenu.data = (model.getCurrentUser() == null ? inPolygonAnonymousMM : inPolygonMM);
		var countDisplay = model.getCurrentLake().localCount + Msgs.USERS;
		userCountLbl.text = countDisplay;
		win.touchEnabled = true;
	}
	else {
		selectedLake.text = Msgs.OUT_OF_ZONE;
		userCountLbl.text = '';
		selectedLake.color = CSSMgr.color3;
		hsMenu.data = outPolygonMM;
		win.touchEnabled = true;
	}
	if (mainInd != null) {
		mainInd.hide();
	}
});

Titanium.App.addEventListener('UPDATED_DISPLAY_NAME', function(e) { 
	if (e.status == 0) {
		userLabel.text = e.displayName;
	}
});


function buildMenu() {
	var tblHeader = Ti.UI.createView({
		height: 30,
		width: 320
	});
	var label = Ti.UI.createLabel({
		top: 5,
		left: 10,
		text: 'HotSpots',
		font: { fontFamily: model.myFont, fontSize: 20, fontWeight: 'bold' },
		color: CSSMgr.color2
	});
	tblHeader.add(label);
		
	// create table view
	hsMenu = Titanium.UI.createTableView({
		top: 45,
		headerView: tblHeader,
		style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		rowBackgroundColor: CSSMgr.color2
	});
	// create table view event listener
	hsMenu.addEventListener('click', function(e){
		Ti.API.info('User selcted to go here: ' + e.rowData.ptr);
		if (e.rowData.ptr) {
			var w = Titanium.UI.createWindow({
				url: e.rowData.ptr,
				backgroundColor: CSSMgr.color0,
				barColor: CSSMgr.color0,
				userHostSpotFlag:e.rowData.userHostSpotFlag,
				title: Msgs.APP_NAME 
			});
			w.model = model;
			Titanium.UI.currentTab.open(w, { animated: true }); 
		}
	});
	hsMenu.backgroundImage = '../dockedbg.png';	
};

/**
 * This method initializes the buzz main menu for user selections.
 */
function init() {

	Ti.API.info('hotSpotMain.init(): Entered ');
	win.touchEnabled = false;
	
	var currentLake = model.getCurrentLake();
	
	inPolygonMM = [{
		title:'My HotSpots',
		hasChild:true,
		writeFlag:false,
		leftImage:'../phone_playmovie.png',
		ptr: 'myHotSpotViewer.js'
	}, {
		title:'Local HotSpots',
		hasChild:true,
		writeFlag:false,
		leftImage:'../phone_playmovie.png',
		ptr: 'localHotSpotViewer.js'
	},
	 {
		title:'Mark HotSpot',
		hasChild:true,
		writeFlag:true,
		leftImage:'../phone_playmovie.png',
		ptr:'markHotSpot.js'
	}
	];
	
	inPolygonAnonymousMM = [{
		title:'Local HotSpots',
		hasChild:true,
		writeFlag:false,
		leftImage:'../phone_playmovie.png',
		ptr:'localHotSpotViewer.js'
	}];
	
	outPolygonMM = [{
		title:'My HotSpots',
		hasChild:true,
		writeFlag:false,
		userHostSpotFlag:true,
		leftImage:'../phone_playmovie.png',
		ptr: 'myHotSpotViewer.js'
	}];
	
	
	if (currentLake != null) {
		Ti.API.info('-----> Inside of a lake polygon!!');
		/*
		 * header
		 */	
		headerView = Base.buildLocationHeader(win, true, '');
		
		/*
		 * menu
		 */
		buildMenu();	
		if (model.getLastLocTime() != 0) {
			hsMenu.data = (model.getCurrentUser() == null ? inPolygonAnonymousMM : inPolygonMM);
		}
		else {
			/*
		 	 * preloader
			 */
			mainInd = Base.showPreloader(win, 'Initializing ...');
		}
		win.add(hsMenu);
		
		win.touchEnabled = true;
	
		/*
		 * timer
		 */	
		setTimeout(function () { 
			Ti.App.fireEvent('LOCATION_CHANGED', {});	
    	}, 20000);
	}
	else {
		Ti.API.info('-----> Outside of a lake polygon!!');
		/*
		 * header
		 */	
		headerView = Base.buildLocationHeader(win, true, '');
		
		/*
		 * menu
		 */
		buildMenu();	
		if (model.getLastLocTime() != 0) {
			hsMenu.data = (model.getCurrentUser() == null ? [] : outPolygonMM);
		}
		else {
			/*
		 	 * preloader
			 */
			mainInd = Base.showPreloader(win, 'Initializing ...');
		}
		win.add(hsMenu);
	}
	
	/*
	 * iAd 
	 */
	Base.attachiAd(win);
	
};

init();
