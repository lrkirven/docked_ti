Ti.include('../util/tools.js');
Ti.include('../util/msgs.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;
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
		selectedLake.color = css.getColor4();
		hsMenu.data = (model.getCurrentUser() == null ? inPolygonAnonymousMM : inPolygonMM);
		var countDisplay = model.getCurrentLake().localCount + Msgs.USERS;
		userCountLbl.text = countDisplay;
		win.touchEnabled = true;
	}
	else {
		selectedLake.text = Msgs.OUT_OF_ZONE;
		userCountLbl.text = '';
		selectedLake.color = css.getColor3();
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

/**
 * This method builds the top header to display location and user information to
 * the user.
 * 
 * @param {Object} currentLake
 */
/*
function buildHeader(currentLake) {
	var h = Ti.UI.createView({
		height: 50,
		top: -100,
		borderColor: css.getColor0(),
		backgroundColor: css.getColor0()
	});
	var t2 = Titanium.UI.createAnimation({
		top: 0,
		duration: 750
	});
		
	var headerLbl0 = 'My Location: ';
	var label0 = Ti.UI.createLabel({
		text: headerLbl0,
		top: 0,
		left: 10,
		height: 20,
		font: { fontFamily: model.myFont, fontSize: 11, fontWeight: 'normal' },
		color: '#fff'
	});
		
		
	var label1 = undefined;
	if (currentLake != null) {
		currentLocationLabel = Ti.UI.createLabel({
			text: currentLake.name,
			top: 15,
			left: 10,
			height: 25,
			font: { fontFamily: model.myFont, fontSize: 16, fontWeight: 'bold' },
			color: css.getColor2()
		});
	}
	else {
		currentLocationLabel = Ti.UI.createLabel({
			text: (model.getLastLocTime() == 0 ? "..." : Msgs.OUT_OF_ZONE),
			top: 15,
			left: 10,
			height: 25,
			font: { fontFamily: model.myFont, fontSize: 16, fontWeight: 'bold' },
			color: css.getColor3()
		});
	}
		
	var displayName = null;
	if (model.getCurrentUser() != null) {
		displayName = model.getCurrentUser().displayName;
	}
	else {
		displayName = "Anonymous";
	}
	userLabel = Ti.UI.createLabel({
		text: displayName,
		top: 0,
		width: 100,
		right: 10,
		height: 20,
		textAlign: 'right',
		font: { fontFamily: model.myFont, fontSize: 13, fontWeight: 'bold' },
		color: '#fff'
	});
	var countDisplay = '';
	if (model.getCurrentLake() != null) {
		countDisplay = model.getCurrentLake().localCount + ' USER(S)';
	}
	userCountLbl = Ti.UI.createLabel({
		text: countDisplay,
		top: 25,
		width: 100,
		right: 10,
		textAlign: 'right',
		height: 20,
		font: { fontFamily: model.myFont, fontSize: 11, fontWeight: 'normal' },
		color: '#fff'
	});
	
	h.add(label0);
	h.add(currentLocationLabel);
	h.add(userLabel);
	h.add(userCountLbl);
	h.animate(t2);	
		
	return h;
};
*/

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
		color: css.getColor2()
	});
	tblHeader.add(label);
		
	// create table view
	hsMenu = Titanium.UI.createTableView({
		top: 45,
		headerView: tblHeader,
		style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
		selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		rowBackgroundColor: css.getColor2()
	});
	// create table view event listener
	hsMenu.addEventListener('click', function(e){
		Ti.API.info('User selcted to go here: ' + e.rowData.ptr);
		if (e.rowData.ptr) {
			var w = Titanium.UI.createWindow({
				url: e.rowData.ptr,
				backgroundColor: css.getColor0(),
				barColor: css.getColor0(),
				userHostSpotFlag:e.rowData.userHostSpotFlag,
				title: model.getAppName() 
			});
			w.model = model;
			w.css = css;
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
		userHostSpotFlag:true,
		leftImage:'../phone_playmovie.png',
		ptr: 'hsViewer.js'
	}, {
		title:'Local HotSpots',
		hasChild:true,
		userHostSpotFlag:false,
		leftImage:'../phone_playmovie.png',
		ptr: 'hsViewer.js'
	}, {
		title:'Mark HotSpot',
		hasChild:true,
		leftImage:'../phone_playmovie.png',
		ptr:'markHotSpot.js'
	}];
	
	inPolygonAnonymousMM = [{
		title:'Local HotSpots',
		hasChild:true,
		userHostSpotFlag:false,
		leftImage:'../phone_playmovie.png',
		ptr:'hsViewer.js'
	}];
	
	outPolygonMM = [{
		title:'My HotSpots',
		hasChild:true,
		userHostSpotFlag:true,
		leftImage:'../phone_playmovie.png',
		ptr: 'hsViewer.js'
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
			mainInd = Base.createPreloader('Initializing ...');
			win.add(mainInd);
			mainInd.show();
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
			mainInd = Base.createPreloader('Initializing ...');
			win.add(mainInd);
			mainInd.show();
		}
		win.add(hsMenu);
	}
	
	/*
	 * iAd 
	 */
	Base.attachiAd(win);
	
};

init();
