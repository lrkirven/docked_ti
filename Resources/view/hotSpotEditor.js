Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/tools.js');
Ti.include('../util/geo.js');
Ti.include('../util/hotspot.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../props/cssMgr.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var MAX_DESC_LENG = 30;

var win = Ti.UI.currentWindow;
var canEdit = win.canEdit;
var hotSpot = win.hotSpot;
var model = win.model;
var submitBtn = null;
var notesText = null;
var descText = null;
var publicFlag = true;
var categoryBtn = null;
var publicBtn = null;



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
	
	var currentLake = model.getCurrentLake();
	
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
		text: ( hotSpot != null ? hotSpot.location : currentLake.name ), 
		font: { fontSize:15, fontFamily: model.myFont, fontWeight: 'bold' },
		top: 5,
		left: 0,
		width: 300,
		textAlign: 'center',
		height: 'auto'
	});
	panel.add(lakeText);
	
	var latText = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: ( hotSpot != null ? Geo.toLat(hotSpot.lat, 'dms', 2) : Geo.toLat(model.getUserLat(), 'dms', 2) ),
		font: { fontSize:13, fontFamily: model.myFont, fontWeight: 'bold' },
		top: 25,
		left: 0,
		width: 150,
		textAlign: 'center',
		height: 'auto'
	});
	panel.add(latText);
	
	var lngText = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: ( hotSpot != null ? Geo.toLon(hotSpot.lng, 'dms', 2) : Geo.toLon(model.getUserLng(), 'dms', 2) ),
		font: { fontSize:13, fontFamily: model.myFont, fontWeight: 'bold' },
		top: 25,
		left: 150,
		width: 150,
		textAlign: 'center',
		height: 'auto'
	});
	panel.add(lngText);
	
	//
	// label
	//
	var prompt1 = currentLake;
	var descLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: Msgs.DESC_LBL,
		font: { fontFamily: model.myFont, fontWeight: 'bold' },
		top: 55,
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
		value: ( hotSpot != null ? hotSpot.desc : '' ),
		top: 75,
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		textAlign: 'left',
		keyboardType: Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		borderWidth: 2,
		borderRadius: 5
	});
	descText.addEventListener('change', function(e){
		var str = descText.value;
		if (str != null && str.length > MAX_DESC_LENG) {
			var modStr = str.substr(0, MAX_DESC_LENG);
			notesText.value = modStr;
			Tools.reportMsg(Msgs.APP_NAME, 'Description is too long');	
			return;
		}
		checkFormData();
	});
	panel.add(descText);
	
	var notesLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: Msgs.NOTES_LBL,
		font: { fontFamily: model.myFont, fontWeight: 'bold' },
		top: 125,
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
		top:145,
		font:{ fontSize:15, fontFamily: model.myFont, fontWeight: 'normal' },
		appearance:Titanium.UI.KEYBOARD_APPEARANCE_ALERT,	
		keyboardType:Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderWidth:2,
		borderColor:CSSMgr.color0,
		borderRadius:5,
		enabled: canEdit,
		value: ( hotSpot != null ? hotSpot.notes : '' )
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
	
	/*
	var catLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Category',
		font: {
			fontFamily: 
			model.myFont,
			fontWeight: 'bold'
		},
		textAlign: 'left',
		top: 235,
		left: 10,
		width: 100,
		height: 'auto'
	});
	panel.add(catLbl);
	*/
	
	categoryBtn = Titanium.UI.createTabbedBar({
    	labels:HotSpot.categoryLabels,
    	backgroundColor:CSSMgr.color4,
    	top:235,
		left:10,
    	style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
    	height:25,
		touchEnabled:canEdit,
    	width:280
	});
	categoryBtn.addEventListener('click', function(e) {
		categoryBtn.index = e.index;
		Ti.API.info('User selected index -- ' + e.index);
		checkFormData();
	});
	if (hotSpot != null) {
		Ti.API.info('Setting category ---> ' + hotSpot.category);
		categoryBtn.index = hotSpot.category;
	}
	else {
		categoryBtn.index = 0;
	}
	panel.add(categoryBtn);
	
	var publicLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'PUBLIC: ',
		font: {
			fontSize:17,
			fontFamily: 
			model.myFont,
			fontWeight: 'bold'
		},
		textAlign: 'right',
		top: 287,
		left: 0,
		width: 150,
		height: 'auto'
	});
	panel.add(publicLbl);
	publicBtn = Titanium.UI.createSwitch({
		value: true,
		top: 285,
		touchEnabled:canEdit,
		backgroundSelectedColor: CSSMgr.color4,
		left: 150
	});
	publicBtn.addEventListener('change', function(e){
		publicFlag = e.value;
		checkFormData();
	});
	if (hotSpot != null) {
		publicBtn.value = hotSpot.publicFlag;
	}
	panel.add(publicBtn);

	
	if (canEdit) {
		/*
		 * submit button
		 */
		submitBtn = Titanium.UI.createButton({
			title: (hotSpot == null ? Msgs.MARK : Msgs.SAVE),
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
			
			/*
			 * creating new hotSpot
			 */
			if (hotSpot == null) {
				hotSpot = {
					category: categoryBtn.index,
					username: user.displayName,
					resourceId: myLocation.id,
					location: myLocation.name,
					llId: user.id,
					publicFlag: publicBtn.value,
					desc: descText.value,
					notes: notesText.value,
					lat: model.getUserLat(),
					lng: model.getUserLng(),
					rating: 0
				};
			}
			/*
			 * updating existing hotSpot
			 */
			else {
				hotSpot.desc = descText.value;
				hotSpot.notes = notesText.value;
				hotSpot.category = categoryBtn.index; 
				hotSpot.publicFlag = publicBtn.value;
				hotSpot.createDate = null;
			}
		
			/*
			 * update service
			 */	
			var restClient = new RestClient();
			var currentUser = model.getCurrentUser();
			restClient.addOrUpdateHotSpot(currentUser.userToken, hotSpot);
		});
		win.setRightNavButton(submitBtn);
	}
	win.add(panel);
	
	//
	// preloader
	//
	postingInd = Base.showPreloader(win, null, true);
	postingInd.hide();
	win.add(postingInd);
};

function performExit() {
	Ti.App.removeEventListener('NEW_HOTSPOT_ADDED', handleHotSpotAddedOrUpdated);
};

function handleHotSpotAddedOrUpdated(e) {
	if (e.status == 0) {
		postingInd.hide();
		Tools.reportMsg(Msgs.APP_NAME, "HotSpot saved!");
		performExit();
		var newHotSpot = {};
		newHotSpot.desc = descText.value;
		newHotSpot.notes = notesText.value;
		newHotSpot.category = categoryBtn.index; 
		newHotSpot.publicFlag = publicBtn.value;
		newHotSpot.lat = hotSpot.lat;
		newHotSpot.lng = hotSpot.lng;
		newHotSpot.location = hotSpot.location;
		newHotSpot.createDate = null;
		Ti.App.fireEvent('RESET_MY_HOTSPOTS', { hotSpot:newHotSpot });
		win.close();
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
	Ti.API.info('hotSpotEditor.init(): canEdit=' + canEdit);
	Base.attachMyBACKButton(win);
	Ti.App.addEventListener('NEW_HOTSPOT_ADDED', handleHotSpotAddedOrUpdated);
	buildForm();
	win.backgroundImage = '../images/Background.png';
	win.open();	
};

/*
 * initial entry
 */
init();
