Ti.include('../util/tools.js');
Ti.include('../util/msgs.js');
Ti.include('../util/geo.js');
Ti.include('../util/hotspot.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../props/cssMgr.js');
Ti.include('../client/picasaClient.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var canEdit = win.canEdit;
var hotSpot = win.hotSpot;
var model = win.model;
var submitBtn = null;
var notesText = null;
var descText = null;



/**
 * This method checks the form data's validity before submitting it to the server.
 */
function checkFormData() {
	if (notesText.value == null || notesText.value.length == 0) {
		submitBtn.enabled = false;
		return;
	}	
	if (descText.value == null || descText.value.length == 0) {
		submitBtn.enabled = false;
		return;
	}	
	submitBtn.enabled = true;
};

/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {
	
	var panel = Ti.UI.createView({ 
		backgroundColor:CSSMgr.color2,
		top:20,
		left:20,
		right:20,
		bottom:20,
		width:300,
		borderRadius:20,
		clickName:'bg'
	});
	
	var lakeText = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: model.getCurrentLake().name, 
		font: { fontSize:15, fontFamily: model.myFont, fontWeight: 'bold' },
		top: 10,
		left: 0,
		width: 300,
		textAlign: 'center',
		height: 'auto'
	});
	panel.add(lakeText);
	
	var latText = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: Geo.toLat(model.getUserLat(), 'dms', 2),
		font: { fontSize:13, fontFamily: model.myFont, fontWeight: 'bold' },
		top: 40,
		left: 0,
		width: 150,
		textAlign: 'center',
		height: 'auto'
	});
	panel.add(latText);
	
	var lngText = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: Geo.toLon(model.getUserLng(), 'dms', 2),
		font: { fontSize:13, fontFamily: model.myFont, fontWeight: 'bold' },
		top: 40,
		left: 150,
		width: 150,
		textAlign: 'center',
		height: 'auto'
	});
	panel.add(lngText);
	
	//
	// label
	//
	var currentLake = model.getCurrentLake().name;
	var prompt1 = currentLake;
	var descLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: Msgs.DESC_LBL,
		font: { fontFamily: model.myFont, fontWeight: 'bold' },
		top: 70,
		left: 10,
		width: 300,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(descLbl);
	
	descText = Titanium.UI.createTextField({
		height: 40,
		width: 280,
		left: 10,
		enabled: canEdit,
		value: hotSpot.desc,
		top: 90,
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		textAlign: 'left',
		keyboardType: Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		borderWidth: 2,
		borderRadius: 5
	});
	descText.addEventListener('change', function(e){
		var str = descText.value;
		if (str != null && str.length > 100) {
			var modStr = str.substr(0, 100);
			notesText.value = modStr;
			Tools.reportMsg(Msgs.APP_NAME, Msgs.MSG_TOO_LONG);	
			return;
		}
		checkFormData();
	});
	panel.add(descText);
	
	var notesLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: Msgs.NOTES_LBL,
		font: { fontFamily: model.myFont, fontWeight: 'bold' },
		top: 140,
		left: 10,
		width: 300,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(notesLbl);
	
	notesText = Titanium.UI.createTextArea({
		height:80,
		width:280,
		left:10,
		top:160,
		font:{ fontSize:15, fontFamily: model.myFont, fontWeight: 'normal' },
		appearance:Titanium.UI.KEYBOARD_APPEARANCE_ALERT,	
		keyboardType:Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderWidth:2,
		borderColor:CSSMgr.color0,
		borderRadius:5,
		enabled: canEdit,
		value: hotSpot.notes
	});
	notesText.addEventListener('change', function(e){
		var str = notesText.value;
		if (str != null && str.length > 140) {
			var modStr = str.substr(0, 140);
			notesText.value = modStr;
			Tools.reportMsg(Msgs.APP_NAME, Msgs.MSG_TOO_LONG);	
			return;
		}
		checkFormData();
	});
	panel.add(notesText);
	
	var categoryLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: Msgs.CATEGORY_LBL,
		font: { fontFamily: model.myFont, fontWeight: 'bold' },
		top: 190,
		left: 10,
		width: 300,
		textAlign: 'left',
		height: 'auto'
	});
	
	var categoryBtn = Titanium.UI.createTabbedBar({
    	labels:HotSpot.categoryLabels,
    	backgroundColor:CSSMgr.color0,
    	top:270,
		left:10,
    	style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
    	height:25,
		enabled:canEdit,
    	width:280
	});
	categoryBtn.addEventListener('click', function(e) {
		categoryBtn.index = e.index;
		Ti.API.info('User selected index -- ' + e.index);
	});
	categoryBtn.index = hotSpot.category;
	panel.add(categoryBtn);
	
	if (canEdit) {
		/*
		 * submit button
		 */
		submitBtn = Titanium.UI.createButton({
			title: Msgs.SAVE,
			style: Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
			enabled: false,
			color: CSSMgr.color0,
			bottom: 20,
			right: 10,
			height: 30,
			width: 100
		});
		submitBtn.addEventListener('click', function(){
			submitBtn.enabled = false;
			var myLocation = null;
			
			postingInd.show();
			Ti.API.info('Saving hotspot to server ...');
			myLocation = model.getCurrentLake();
			var user = model.getCurrentUser();
			hotSpot =  {
				category: categoryBtn.index,
				username: currentUser.displayName,
				resourceId: myLocation.id,
				llId: user.id,
				desc: descText.value,
				notes: notesText.value,
				lat: model.getUserLat(),
				lng: model.getUserLng(),
				rating: 0
			};
			
			var restClient = new RestClient();
			restClient.addHotSpot(currentUser.userToken, hotSpot);
		});
		win.setRightNavButton(submitBtn);
	}
	win.add(panel);
	
	//
	// preloader
	//
	postingInd = Titanium.UI.createActivityIndicator({
		top: 50,
		left: 140,
		height: 150,
		width: 50,
		style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
	});
	postingInd.font = {
		fontFamily: model.myFont,
		fontSize: 15,
		fontWeight: 'bold'
	};
	postingInd.color = CSSMgr.color3;
	win.add(postingInd);
};

function performExit() {
	Ti.App.removeEventListener('NEW_HOTSPOT_ADDED', handleNewMsgPosted);
};

function handleNewHotSpotAdded(e) {
	if (e.status == 0) {
		postingInd.hide();
		Tools.reportMsg(Msgs.APP_NAME, "HotSpot saved!");
		performExit();
		Ti.App.fireEvent('OPEN_MY_HOTSPOTS', {});
	}
	else {
		postingInd.hide();
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);
	}
};


/**
 * Initialize the form
 */
function init() {
	Base.attachMyBACKButton(win);
	Ti.App.addEventListener('NEW_HOTSPOT_ADDED', handleNewHotSpotAdded);
	buildForm();
	win.backgroundImage = '../dockedbg.png';
	win.open();	
};

/*
 * initial entry
 */
init();
