Ti.include('../model/modelLocator.js');
Ti.include('../client/picasaClient.js');
Ti.include('../client/restClient.js');
Ti.include('../util/tools.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;
var composeMsgWinPhotoIndBtn = null;
var post2FB = false;

function postMessage2FB(m) {
	if (Titanium.Facebook.isLoggedIn()) {
		var fbRec = null;
		
		if (m.photoUrl != null) {
			fbRec = {
				name: m.displayName + " via " + model.getAppName(),
				href:"http://www.lazylaker.net",
				caption:m.messageData,
				description:"Message from " + m.displayName + " on " + m.location ,
				media:[{ type:"image", src:m.photoUrl, href:"http://www.lazylaker.net" }],
				properties:{}
			};
		}
		else {
			fbRec = {
				name: m.displayName + " via " + model.getAppName(),
				href:"http://www.lazylaker.net",
				caption:m.messageData,
				description:"Message from " + m.displayName + " on " + m.location ,
				properties:{}
			};
		}
	
		Titanium.Facebook.publishStream(m.messageData, fbRec, null, function(r) {
			if (r.success) {
				var alertDialog = Titanium.UI.createAlertDialog({
					message: 'Message posted!',
					buttonNames: ['OK']
				});
				alertDialog.show();
				performExit();
				win.close();
			}
			else {
				Ti.API.info('Failed to post my message to FB ....');
			}
		});
	}
};

/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {
	//
	// label
	//
	var currentLake = model.getCurrentLake().name;
	var hint = "Buzz on '" + currentLake + "'?";
	var prompt1 = currentLake;
	var msgLbl = Titanium.UI.createLabel({
		color: '#fff',
		text: prompt1,
		font: { fontFamily: model.myFont, fontWeight: 'bold' },
		top: 10,
		right: 10,
		width: 300,
		textAlign: 'right',
		height: 'auto'
	});
	win.add(msgLbl);
	
	if (model.getUseFBProfilePic() && model.getFBProfileUrl() != null) {
		var userProfilePhoto = Ti.UI.createImageView({
			image: model.getFBProfileUrl(),
			backgroundColor: css.getColor0(),
			borderColor: css.getColor2(),
			top: 10,
			left: 10,
			width: 50,
			height: 50,
			clickName: 'photo'
		});
		win.add(userProfilePhoto);
	}
	else {
		var defaultIDImage = Ti.UI.createImageView({
			image: '../user.png',
			backgroundColor:css.getColor0(),
			borderColor:css.getColor2(),
			top: 10,
			left: 10,
			width:50,
			height:50,
			clickName:'defaultIDImage'
		});
		win.add(defaultIDImage);
	}
	
	//
	// textfield to enter message to post
	//
	var msgText = Titanium.UI.createTextField({
		hintText: hint,
		height: 50,
		width: 300,
		left: 10,
		top: 75,
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		textAlign: 'left',
		keyboardType: Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		borderWidth: 2,
		borderRadius: 5
	});
	msgText.addEventListener('change', function(e){
		if ((msgText.text == '' || msgText == null) && model.getPendingRawImage() == null) {
			composeMsgWinSubmitBtn.enabled = false;
		}
		else {
			composeMsgWinSubmitBtn.enabled = true;
		}
	});
	win.add(msgText);
	
	//
	// icon to indicate if the photo is loaded
	//
	var photoIndBtn = Ti.UI.createImageView({
		image: '../commentButton.png',
		backgroundColor: css.getColor0(),
		borderColor: css.getColor2(),
		top: 145,
		left: 10,
		width: 75,
		height: 75,
		clickName: 'addPhotoBtn'
	});
	win.add(photoIndBtn);
	composeMsgWinPhotoIndBtn = photoIndBtn;
	
	//
	// photo menu
	//
	var photoMenuList = [
		{ title: 'Take a picture', color: '#fff', url: 'takePhoto.js' }, 
		{ title: 'From gallery', color: '#fff', url: 'browseGallery.js' }
	];
	var photoMenu = Titanium.UI.createTableView({
		data: photoMenuList,
		scrollable: false,
		separatorColor: css.getColor2(),
		style: Titanium.UI.iPhone.TableViewStyle.PLAIN,
		top: 135,
		right: 10,
		height: 100,
		width: 200,
		color: '#fff',
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		backgroundColor: css.getColor0()
	});
	photoMenu.addEventListener('click', function(e){
		if (e.rowData.url) {
			var helperWin = Titanium.UI.createWindow({
				url: e.rowData.url,
				title: e.rowData.title,
				backgroundColor: css.getColor0(),
				barColor: css.getColor0()
			});
			helperWin.model = model;
			helperWin.css = css;
			helperWin.addEventListener('close', function(e){
				if (model.getPendingRawImage() != null) {
					photoIndBtn.image = model.getPendingRawImage();
				}
			});
			helperWin.open();
		}
	});
	win.add(photoMenu);
	
	//
	// switch label and component
	//	
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
	//
	// submit button
	//
	var submitBtn = Titanium.UI.createButton({
		title: 'Post!',
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
		
		//
		// uploading image and posting message
		//
		var resId = 258006;
		var currentUser = model.getCurrentUser();
		if (rawImage != null) {
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
				lng: model.getUserLng()
			};
			//
			// add user's profile url to message if they have one
			//
			profilePic = model.getFBProfileUrl();
			if (profilePic != null) {
				msgEvent.profileUrl = profilePic;
				Ti.API.info('Adding fb profile pic .... ' + profilePic);
			}
			else {
				Ti.API.info('Not adding fb profile pic ....');
			}
			model.setPendingMsgEvent(msgEvent);
			Ti.API.info('Pending msgEvent: ' + msgEvent);
			//
			// upload photo
			//
			var imgClient = new PicasaClient('lazylaker71@gmail.com', '19lazylaker');
			imgClient.upload('lazylaker71@gmail.com', '19lazylaker', rawImage);
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
				lng: model.getUserLng()
			};
			//
			// add user's profile url to message if they have one
			//
			profilePic = model.getFBProfileUrl();
			if (profilePic != null) {
				msgEvent.profileUrl = profilePic;
				Ti.API.info('Adding fb profile pic .... ' + profilePic);
			}
			else {
				Ti.API.info('Not adding fb profile pic ....');
			}
			restClient = new RestClient();
			restClient.postMessage(currentUser.id, msgEvent);
		}
	});
	win.setRightNavButton(submitBtn);
	// win.add(submitBtn);
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
		Tools.reportMsg(model.getAppName(), 'Unable to complete request at this time');
		postingInd.hide();
		Ti.App.removeEventListener('NEW_MSG_EVENT_ADDED', handleNewMsgPosted);
		win.close();
	}
};


/**
 * Initialize the form
 */
function init() {
	
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
			composeMsgWinSubmitBtn.enabled = false;
		}
	});
	
	Ti.App.addEventListener('NEW_MSG_EVENT_ADDED', handleNewMsgPosted);
	buildForm();
	win.open();	
};

//
// initial entry
//
init();
