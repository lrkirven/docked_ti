Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/date.format.js');
Ti.include('../util/tools.js');
Ti.include('../props/cssMgr.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/picasaClient.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var composeMsgWinPhotoIndBtn = null;
var post2FB = false;
var addToMyHotSpots = false;

var b = Titanium.UI.createButton({title:'BACK'});
b.addEventListener('click', function() {
	win.close();
});
win.leftNavButton = b;

function postMessage2FB(m) {
	if (Titanium.Facebook.isLoggedIn()) {
		var fbRec = null;
		if (m.photoUrl != null) {
			fbRec = {
				name: m.displayName + " via " + Msgs.APP_NAME,
				href:"http://www.docked.co",
				caption:m.messageData,
				description:"Message from " + m.displayName + " on " + m.location ,
				media:[{ type:"image", src:m.photoUrl, href:"http://www.docked.co" }],
				properties:{}
			};
		}
		else {
			fbRec = {
				name: m.displayName + " via " + Msgs.APP_NAME,
				href:"http://www.docked.co",
				caption:m.messageData,
				description:"Message from " + m.displayName + " on " + m.location ,
				properties:{}
			};
		}
	
		Titanium.Facebook.publishStream(m.messageData, fbRec, null, function(r) {
			if (r.success) {
				Tools.reportMsg(Msgs.APP_NAME, Msgs.MSG_POSTED);	
				performExit();
				win.close();
			}
			else {
				Ti.API.info('Failed to post my message to FB ....');
			}
		});
	}
	else {
		Ti.API.warn('**** User is not logged into Facebook -- Cannot post message to FB');
		Tools.reportMsg(Msgs.APP_NAME, Msgs.MSG_POSTED);	
		performExit();
		win.close();
	}
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
		bottom:10,
		width:'auto',
		height:340,
		borderRadius:20,
		clickName:'bg'
	});
	
	//
	// label
	//
	var currentLake = model.getCurrentLake().name;
	var hint = "Buzz on '" + currentLake + "'?";
	var prompt1 = currentLake;
	var msgLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: prompt1,
		font: { fontFamily: model.myFont, fontWeight: 'bold' },
		top: 10,
		right: 10,
		width: 300,
		textAlign: 'right',
		height: 'auto'
	});
	panel.add(msgLbl);
	
	if (model.getUseFBProfilePic() && model.getFBProfileUrl() != null) {
		var userProfilePhoto = Ti.UI.createImageView({
			image: model.getFBProfileUrl(),
			backgroundColor: CSSMgr.color0,
			borderColor: CSSMgr.color2,
			top: 10,
			left: 10,
			width: 50,
			height: 50,
			clickName: 'photo'
		});
		panel.add(userProfilePhoto);
	}
	else {
		var defaultIDImage = Base.createProfilePic(10, 10);
		panel.add(defaultIDImage);
	}
	
	/*	
	var msgText = Titanium.UI.createTextField({
		hintText: hint,
		height: 50,
		width: 280,
		left: 10,
		top: 75,
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		textAlign: 'left',
		keyboardType: Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		borderWidth: 2,
		borderRadius: 5
	});
	*/
	var msgText = Titanium.UI.createTextArea({
		height:80,
		width:260,
		left:10,
		top:75,
		font:{ fontSize:15, fontFamily: model.myFont, fontWeight: 'normal' },
		appearance:Titanium.UI.KEYBOARD_APPEARANCE_ALERT,	
		keyboardType:Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderWidth:2,
		borderColor:CSSMgr.color0,
		borderRadius:5
	});
	msgText.addEventListener('change', function(e){
		var str = msgText.value;
		if (str != null && str.length > 140) {
			composeMsgWinSubmitBtn.enabled = false;
			var modStr = str.substr(0, 140);
			msgText.value = modStr;
			Tools.reportMsg(Msgs.APP_NAME, 'Your message is too long!');	
			return;
		}
		if ((msgText.value == '' || msgText == null) && model.getPendingRawImage() == null) {
			composeMsgWinSubmitBtn.enabled = false;
		}
		else {
			composeMsgWinSubmitBtn.enabled = true;
		}
	});
	panel.add(msgText);
	
	//
	// icon to indicate if the photo is loaded
	//
	var photoIndBtn = Ti.UI.createImageView({
		image: '../commentButton.png',
		backgroundColor: CSSMgr.color2,
		borderColor: CSSMgr.color2,
		top: 175,
		left: 10,
		width: 75,
		height: 75,
		clickName: 'addPhotoBtn'
	});
	panel.add(photoIndBtn);
	composeMsgWinPhotoIndBtn = photoIndBtn;
	
	//
	// photo menu
	//
	var photoMenuList = [
		{ title: Msgs.TAKE_PIC, color: CSSMgr.color0, url: 'takePhoto.js' }, 
		{ title: Msgs.SELECT_FROM_GALLERY, color: CSSMgr.color0, url: 'browseGallery.js' }
	];
	var photoMenu = Titanium.UI.createTableView({
		data: photoMenuList,
		scrollable: false,
		separatorColor: CSSMgr.color0,
		style: Titanium.UI.iPhone.TableViewStyle.PLAIN,
		top: 165,
		right: 10,
		height: 100,
		width: 200,
		color: CSSMgr.color0,
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		backgroundColor: CSSMgr.color2
	});
	photoMenu.addEventListener('click', function(e){
		if (e.rowData.url) {
			var helperWin = Titanium.UI.createWindow({
				url: e.rowData.url,
				barImage: 'Header.png',
				backgroundColor: CSSMgr.color0,
				barColor: CSSMgr.color0
			});
			helperWin.model = model;
			helperWin.addEventListener('close', function(e){
				if (model.getPendingRawImage() != null) {
					photoIndBtn.image = model.getPendingRawImage();
				}
			});
			helperWin.open();
		}
	});
	panel.add(photoMenu);
	
	var msgLbl3 = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Add location to My HotSpots',
		font: {
			fontFamily: model.myFont,
			fontWeight: 'bold'
		},
		textAlign: 'right',
		top: 275,
		right: 10,
		width: 260,
		height: 'auto'
	});
	panel.add(msgLbl3);
	var switchBtn = Titanium.UI.createSwitch({
		value: false,
		top: 300,
		right: 10
	});
	switchBtn.addEventListener('change', function(e){
		addToMyHotSpots = e.value;
	});
	panel.add(switchBtn);

	/*	
	if (Titanium.Facebook.isLoggedIn()) {
		var prompt3 = "Facebook?";
		var msgLbl3 = Titanium.UI.createLabel({
			color: '#fff',
			text: prompt3,
			font: {
				fontFamily: model.myFont,
				fontWeight: 'bold'
			},
			top: 255,
			left: 130,
			width: 300,
			height: 'auto'
		});
		win.add(msgLbl3);
		var switchBtn = Titanium.UI.createSwitch({
			value: false,
			top: 255,
			right: 10
		});
		switchBtn.addEventListener('change', function(e){
			post2FB = e.value;
			Ti.API.info('-------------------> Posting to Facebook? ' + post2FB);
		});
		win.add(switchBtn);
	}
	*/
	
	/*
	 * submit button
	 */
	var submitBtn = Titanium.UI.createButton({
		title: 'Post!',
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
		Ti.API.info('Start save message process ...');
		var rawImage = model.getPendingRawImage();
		var msgEvent = null;
		var myLocation = null;
		var restClient = null;
		var profilePic = null;
		var now = new Date();	
		var timeStr = now.format();
		
		//
		// uploading image and posting message
		//
		var currentUser = model.getCurrentUser();
		if (rawImage == null) {
			postingInd.message = "";
			postingInd.show();
			myLocation = model.getCurrentLake();
			msgEvent = {
				title: '',
				version: 0,
				username: currentUser.displayName,
				resourceId: myLocation.id,
				location: myLocation.name,
				messageData: msgText.value,
				lat: model.getUserLat(),
				lng: model.getUserLng(),
				userLocalTime: timeStr
			};
			//
			// add user's profile url to message if they have one
			//
			profilePic = model.getFBProfileUrl();
			if (model.getUseFBProfilePic() && profilePic != null) {
				msgEvent.profileUrl = profilePic;
				Ti.API.info('Adding fb profile pic .... ' + profilePic);
			}
			else {
				Ti.API.info('Not adding fb profile pic ....');
			}
			model.setPendingMsgEvent(msgEvent);
			Ti.API.info('Pending msgEvent: ' + msgEvent);
			
			/*
			var imgClient = new PicasaClient('lazylaker71@gmail.com', '19lazylaker');
			imgClient.upload('lazylaker71@gmail.com', '19lazylaker', rawImage);
			*/
			
			/*
			 * Upload photo
			 */
			var pUser = model.getPicasaUser();
			var pPassword = model.getPicasaPassword();
			var photoClient = new PicasaClient();
			Ti.API.info('Using Picasa user: ' + pUser);
			Ti.API.info('Using Picasa password: ' + pPassword);
			photoClient.setPicasaUser(pUser);
			photoClient.setPicasaPassword(pPassword);
			// imgClient.upload2(rawImage);
		}
		//
		// just posting message
		//
		else {
			postingInd.message = "";
			postingInd.show();
			Ti.API.info('Starting simple process of just posting message to server ...');
			myLocation = model.getCurrentLake();
			msgEvent = {
				title: '',
				version: 0,
				username: currentUser.displayName,
				resourceId: myLocation.id,
				location: myLocation.name,
				messageData: msgText.value,
				lat: model.getUserLat(),
				lng: model.getUserLng(),
				userLocalTime: timeStr
			};
			//
			// add user's profile url to message if they have one
			//
			profilePic = model.getFBProfileUrl();
			if (model.getUseFBProfilePic() && profilePic != null) {
				msgEvent.profileUrl = profilePic;
				Ti.API.info('Adding fb profile pic .... ' + profilePic);
			}
			else {
				Ti.API.info('Not adding fb profile pic ....');
			}
			restClient = new RestClient();
			Ti.API.info('BuzzMsg TIMESTAMP ----> ' + msgEvent.userLocalTime);
			restClient.postMessage(currentUser.id, msgEvent, addToMyHotSpots);
		}
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
	postingInd.color = CSSMgr.color3;
	win.add(postingInd);
};

function performExit() {
	Ti.App.removeEventListener('NEW_MSG_EVENT_ADDED', handleNewMsgPosted);
};

function handleNewMsgPosted(e) {
	if (e.status == 0) {
		if (post2FB) {
			postingInd.hide();
			Ti.API.info('handleNewMsgPosted(): Going to facebook ---> ' + e.origMsgEvent);
			postMessage2FB(e.origMsgEvent);
		}
		else {
			postingInd.hide();
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
		postingInd.hide();
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);
		performExit();
		win.close();
	}
};


function handleUploadedPic(e) {
	if (e.loaded) {
		var uploadedEntry = e.entry;
		var currentUser = model.getCurrentUser();
		var msgEvent = model.getPendingMsgEvent();
		msgEvent.photoUrl = uploadedEntry.url;
		model.setPendingMsgEvent(msgEvent);
		var restClient = new RestClient();
		restClient.postMessage(currentUser.id, msgEvent);
		
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, 'Unable to complete request at this time');
		postingInd.hide();
		Ti.App.removeEventListener('NEW_MSG_EVENT_ADDED', handleNewMsgPosted);
		win.close();
	}
};


/**
 * Initialize the form
 */
function init() {
	
	post2FB = model.getSync2Fb();
	
	Titanium.App.addEventListener('PHOTO_UPLOADED', handleUploadedPic);

	Titanium.App.addEventListener('FOUND_LAST_BUCKET', function(e) {
		Ti.API.info('Got event FOUND_LAST_BUCKET .. lastBucket=' + e.lastBucket);
		model.setLastBucket(e.lastBucket);
		if (composeMsgWinSubmitBtn != null) {
			Ti.API.info('Enabling submitBtn ...');
			composeMsgWinSubmitBtn.enabled = true;
		}
		else {
			Ti.API.info('Disabling submitBtn ...');
			compWinSubmitBtn.enabled = false;
		}
	});
	
	Ti.App.addEventListener('NEW_MSG_EVENT_ADDED', handleNewMsgPosted);
	buildForm();
	win.backgroundImage = '../images/Background.png';
	win.open();	
};

//
// initial entry
//
init();
