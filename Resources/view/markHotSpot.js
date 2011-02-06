Ti.include('../util/tools.js');
Ti.include('../util/msgs.js');
Ti.include('../util/geo.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/picasaClient.js');
Ti.include('../client/restClient.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;
var composeMsgWinPhotoIndBtn = null;
var post2FB = false;

var b = Titanium.UI.createButton({title:'BACK'});
b.addEventListener('click', function() {
	win.close();
});
win.leftNavButton = b;

/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {
	
	var panel = Ti.UI.createView({ 
		backgroundColor:'#cccccc',
		top:20,
		left:20,
		right:20,
		bottom:20,
		width:300,
		borderRadius:20,
		clickName:'bg'
	});
	
	var lakeText = Titanium.UI.createLabel({
		color: css.getColor0(),
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
		color: css.getColor0(),
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
		color: css.getColor0(),
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
	var hint = "HotSpot on '" + currentLake + "'?";
	var prompt1 = currentLake;
	var descLbl = Titanium.UI.createLabel({
		color: css.getColor0(),
		text: 'Description: ',
		font: { fontFamily: model.myFont, fontWeight: 'bold' },
		top: 70,
		left: 10,
		width: 300,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(descLbl);
	
	var descText = Titanium.UI.createTextField({
		height: 40,
		width: 280,
		left: 10,
		top: 90,
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		textAlign: 'left',
		keyboardType: Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		borderWidth: 2,
		borderRadius: 5
	});
	panel.add(descText);
	
	var notesLbl = Titanium.UI.createLabel({
		color: css.getColor0(),
		text: 'Notes: ',
		font: { fontFamily: model.myFont, fontWeight: 'bold' },
		top: 140,
		left: 10,
		width: 300,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(notesLbl);
	
	var notesText = Titanium.UI.createTextArea({
		height:80,
		width:280,
		left:10,
		top:160,
		font:{ fontSize:15, fontFamily: model.myFont, fontWeight: 'normal' },
		appearance:Titanium.UI.KEYBOARD_APPEARANCE_ALERT,	
		keyboardType:Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderWidth:2,
		borderColor:css.getColor0(),
		borderRadius:5
	});
	notesText.addEventListener('change', function(e){
		var str = msgText.value;
		if (str != null && str.length > 140) {
			composeMsgWinSubmitBtn.enabled = false;
			var modStr = str.substr(0, 140);
			msgText.value = modStr;
			Tools.reportMsg(model.getAppName(), 'Your message is too long!');	
			return;
		}
		if ((msgText.value == '' || msgText == null) && model.getPendingRawImage() == null) {
			composeMsgWinSubmitBtn.enabled = false;
		}
		else {
			composeMsgWinSubmitBtn.enabled = true;
		}
	});
	panel.add(notesText);
	
	var categoryLbl = Titanium.UI.createLabel({
		color: css.getColor0(),
		text: 'Category: ',
		font: { fontFamily: model.myFont, fontWeight: 'bold' },
		top: 190,
		left: 10,
		width: 300,
		textAlign: 'left',
		height: 'auto'
	});
	
	var categoryBtn = Titanium.UI.createTabbedBar({
    	labels:['Catch', 'Launch', 'Bait', 'Other'],
    	backgroundColor:css.getColor0(),
    	top:270,
		left:10,
    	style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
    	height:25,
    	width:280
	});
	categoryBtn.addEventListener('click', function(e) {
		categoryBtn.index = e.index;
		Ti.API.info('User selected index -- ' + e.index);
	});
	categoryBtn.index = 0;
	panel.add(categoryBtn);
	
	/*
	 * submit button
	 */
	var submitBtn = Titanium.UI.createButton({
		title: 'Mark!',
		style: Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		enabled: false,
		color: css.getColor0(),
		bottom: 20,
		right: 10,
		height: 30,
		width: 100
	});
	submitBtn.addEventListener('click', function(){
		submitBtn.enabled = false;
		Ti.API.info('Start save message process ...');
		var rawImage = model.getPendingRawImage();
		var msgEvent = null;
		var myLocation = null;
		var restClient = null;
		var profilePic = null;
		
		postingInd.message = "";
		postingInd.show();
		Ti.API.info('Starting simple process of just posting message to server ...');
		myLocation = model.getCurrentLake();
		hotSpot = 
		{
			title: '',
			version: 0,
			username: currentUser.displayName,
			resourceId: myLocation.id,
			location: myLocation.name,
			desc: msgText.value,
			lat: model.getUserLat(),
			lng: model.getUserLng()
		};
		
		/*
		profilePic = model.getFBProfileUrl();
		if (profilePic != null) {
			msgEvent.profileUrl = profilePic;
			Ti.API.info('Adding fb profile pic .... ' + profilePic);
		}
		else {
			Ti.API.info('Not adding fb profile pic ....');
		}
		*/
		
		restClient = new RestClient();
		restClient.addHotSpot(currentUser.userToken, hotSpot);
	});
	win.add(panel);
	win.setRightNavButton(submitBtn);
	composeMsgWinSubmitBtn = submitBtn;
	
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
	postingInd.color = css.getColor3();
	win.add(postingInd);
};

function performExit() {
	Ti.App.removeEventListener('NEW_MSG_EVENT_ADDED', handleNewMsgPosted);
};

function handleNewMsgPosted(e) {
	if (e.status == 0) {
		if (post2FB) {
			postingInd.visible = false;
			Ti.API.info('handleNewMsgPosted(): Going to facebook ---> ' + e.origMsgEvent);
			postMessage2FB(e.origMsgEvent);
		}
		else {
			postingInd.visible = false;
			var alertDialog = Titanium.UI.createAlertDialog({
				message: 'Message posted!',
				buttonNames: ['OK']
			});
			alertDialog.show();
			performExit();
			win.close();
		}
	}
	else {
		postingInd.visible = false;
		Tools.reportMsg(model.getAppName(), e.errorMsg);
		performExit();
		win.close();
	}
};


/**
 * Initialize the form
 */
function init() {
	Ti.App.addEventListener('NEW_HOTSPOT_ADDED', handleNewMsgPosted);
	buildForm();
	win.backgroundImage = '../dockedbg.png';
	win.open();	
};

//
// initial entry
//
init();
