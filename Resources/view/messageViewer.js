Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

/**
 * local variables
 */
var win = Ti.UI.currentWindow;
var model = win.model;
var picasa = win.picasa;
var css = win.css;
var currentLake = null;
var tableView = null;
var headerView = null;
var composeMsgWin = null;
var composeMsgWinSubmitBtn = null;
var composeMsgWinPhotoIndBtn = null;
var postingInd = null;
var uploadInd = null;
var alertedUserOfNoMsgs = false;
var initPreloader = null;
var userCountLbl = null;
var newPostBtn = null;


Ti.App.addEventListener('LOCATION_CHANGED', function(e) {
	if (model.getCurrentLake() != null) {
		var countDisplay = model.getCurrentLake().localCount + ' Laker(s)';	
		userCountLbl.text = countDisplay;
		if (newPostBtn != null) {
			newPostBtn.enabled = true;
		}	
	}
	else {
		if (newPostBtn != null) {
			newPostBtn.enabled = false;
		}	
	}
});

/**
 * This method is event handler to popup my photo.
 * 
 * @param {Object} e
 */
function popupImageViewer() {
	var currentUser = model.getCurrentUser();
	var user = currentUser.displayName;
	Ti.API.info('popImageViewer: Current user:' + user);
	var t = Titanium.UI.create2DMatrix();
	t = t.scale(0);

	var w = Titanium.UI.createWindow({
		backgroundColor:css.getColor0(),
		borderWidth:4,
		borderColor:css.getColor4(),
		height:350,
		width:300,
		borderRadius:10,
		opacity:0.99,
		transform:t
	});
	
	// create first transform to go beyond normal size
	var t1 = Titanium.UI.create2DMatrix();
	t1 = t1.scale(1.1);
	var a = Titanium.UI.createAnimation();
	a.transform = t1;
	a.duration = 200;

	// when this animation completes, scale to normal size
	a.addEventListener('complete', function() {
		Titanium.API.info('here in complete');
		var t2 = Titanium.UI.create2DMatrix();
		t2 = t2.scale(1.0);
		w.animate({transform:t2, duration:200});
	});
		
	var photo = Ti.UI.createView({ 
		backgroundImage:'../user.png',
		top:0,
		left:10,
		right:10,
		width:300,
		height:300,
		clickName:'photo' 
	});
	w.add(photo);
	
	// create a button to close window
	var b = Titanium.UI.createButton({
		title:'Close',
		height:30,
		width:100,
		left:190,
		top:w.height-30-10,
		color:css.getColor0()
	});
	w.add(b);
	
	var displayLbl = '   ' + user + '@' + model.getLakeDisplay();	
	var photoLocLbl = Ti.UI.createLabel({
		backgroundColor:'#F0EAC3',
		color:css.color0,
		font:{fontSize:11, fontWeight:'normal', fontFamily:'Arial'},
		left:0,
		top:280,
		height:20,
		width:w.width,
		clickName:'photoLocLbl',
		text:displayLbl
	});
	w.add(photoLocLbl);
		
	b.addEventListener('click', function() {
		var t3 = Titanium.UI.create2DMatrix();
		t3 = t3.scale(0);
		w.close({transform:t3,duration:300});
	});
		
	Ti.API.info('popImageViewer: Trying to open window');
	w.addEventListener('close', function(e) {
    	Ti.API.info('addNoteWindow closed');
	});
	// open window
	w.open(a);
};

function onPhotoBtnClick(e) {
	popupImageViewer();
}

//
// CREATE SEARCH BAR
//
var searchBar = Titanium.UI.createSearchBar({
	barColor:'#687067', 
	opacity:'.95',
	zIndex:10,
	showCancel:false
});

searchBar.addEventListener('change', function(e) {
	// search string as user types
   Ti.API.info('search: value=' + e.value);
});

searchBar.addEventListener('return', function(e) {
   search.blur();
   Ti.API.info('search: return: ' + e.value);
});

searchBar.addEventListener('cancel', function(e) {
   search.blur();
   Ti.API.info('search: cancel: ' + e.value);
});

function formatComments(str, len) {
	var s = '' + str;
	while (s.length < len) {
		s = s + '';
	}
   	Ti.API.info('formatComments: Returning [' + s + '] ' + s.length);
	return s;
}

/**
 * This method builds a message view without an attached photo to be added to an individual 
 * row inside of the table.
 * 
 * @param {Object} row
 * @param {Object} fontSize
 */
function appendMsgBody(row, fontSize) {
	var msgEvent = row.msgEvent;
	var msgBody = null;
	var userLocale = null;
	var userMsg = null;
	
	if (msgEvent.messageData != null && msgEvent.messageData.length > 35) {
		
		row.height = 90;
		
		msgBody = Ti.UI.createView({
			backgroundColor:css.getColor0(),
			left:60,
			top:0,
			height:90,
			width:230,
			clickName:'msgBody'
		});
		
		userMsg = Ti.UI.createLabel({
			color: '#fff',
			font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
			left: 5,
			top: 0,
			height: 50,
			width: 220,
			clickName: 'userMsg',
			text: msgEvent.messageData
		});
		
		msgBody.add(userMsg);
		
		userLocale = Ti.UI.createLabel({
			color:css.getColor2(),
			font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
			left:5,
			top:35,
			height:50,
			textAlign:'left',
			width:220,
			clickName:'userLocale',
			text:(msgEvent.username + ' on ' + msgEvent.location + ', ' + msgEvent.timeDisplay)
		});
		
		msgBody.add(userLocale);
	}
	else {
		row.height = 65;
		
		msgBody = Ti.UI.createView({
			backgroundColor:css.getColor0(),
			left:60,
			top:0,
			height:65,
			width:230,
			clickName:'msgBody'
		});
		
		userMsg = Ti.UI.createLabel({
			color: '#fff',
			font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
			left: 5,
			top: 0,
			height: 25,
			width: 220,
			clickName: 'userMsg',
			text: msgEvent.messageData
		});
		
		msgBody.add(userMsg);
		
		userLocale = Ti.UI.createLabel({
			color:css.getColor2(),
			font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
			left:5,
			top:15,
			height:50,
			textAlign:'left',
			width:220,
			clickName:'userLocale',
			text:(msgEvent.username + ' on ' + msgEvent.location + ', ' + msgEvent.timeDisplay)
		});
		
		msgBody.add(userLocale);
	}
	
	row.add(msgBody);	
	
}; 

/**
 * This method builds a message view with photo to be added to a row inside of a table.
 * 
 * @param {Object} row
 * @param {Object} fontSize
 */
function appendMsgBodyWithPhoto(row, fontSize) {
	var msgBody = null;
	var msgPhoto = null;
	var userLocale = null;
	var msgEvent = row.msgEvent;
	
	if (msgEvent.messageData != null && msgEvent.messageData.length > 20) {
		
		row.height = 90;
		
		msgBody = Ti.UI.createView({
			backgroundColor: css.getColor0(),
			left: 60,
			top: 0,
			height: 90,
			width: 230,
			clickName: 'msgBody'
		});
		msgPhoto = Ti.UI.createImageView({
			image: msgEvent.photoUrl,
			backgroundColor: css.getColor0(),
			borderColor: css.getColor1(),
			top: 12,
			left: 0,
			width: 50,
			height: 50,
			clickName: 'msgPhoto'
		});
		msgBody.add(msgPhoto);
		
		userMsg = Ti.UI.createLabel({
			color: '#fff',
			font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
			left: 60,
			top: 0,
			height: 50,
			width: 160,
			clickName: 'comment',
			text: msgEvent.messageData
		});
		msgBody.add(userMsg);
		
		var desc1 = msgEvent.username + ' on ' + msgEvent.location + ', ' + msgEvent.timeDisplay;
		if (desc1.length > 45) {
			desc1 = desc1.substr(0, 40);
			desc1 += "...";
		}
		userLocale = Ti.UI.createLabel({
			color: css.getColor2(),
			font: { fontSize: 11, fontWeight: 'normal', fontFamily: model.myFont },
			left: 60,
			top: 35,
			height: 50,
			textAlign: 'left',
			width: 160,
			clickName: 'userLocale',
			text:desc1
		});
		msgBody.add(userLocale);
	}
	else {
		
		row.height = 75;
		
		msgBody = Ti.UI.createView({
			backgroundColor: css.getColor0(),
			left: 60,
			top: 0,
			height: 65,
			width: 230,
			clickName: 'msgBody'
		});
		msgPhoto = Ti.UI.createImageView({
			image: msgEvent.photoUrl,
			backgroundColor: css.getColor0(),
			borderColor: css.getColor1(),
			top: 12,
			left: 0,
			width: 50,
			height: 50,
			clickName: 'msgPhoto'
		});
		msgBody.add(msgPhoto);
		
		userMsg = Ti.UI.createLabel({
			color: '#fff',
			font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
			left: 60,
			top: 0,
			height: 25,
			width: 160,
			clickName: 'userMsg',
			text: msgEvent.messageData
		});
		msgBody.add(userMsg);
		
		var desc2 = msgEvent.username + ' on ' + msgEvent.location + ', ' + msgEvent.timeDisplay;
		if (desc2.length > 45) {
			desc2 = desc2.substr(0, 40);
			desc2 += "...";
		}
		userLocale = Ti.UI.createLabel({
			color: css.getColor2(),
			font: { fontSize: 11, fontWeight: 'normal', fontFamily: model.myFont },
			left: 60,
			top: 15,
			height: 50,
			textAlign: 'left',
			width: 160,
			clickName: 'userLocale',
			text: desc2
		});
		msgBody.add(userLocale);
	}
	row.add(msgBody);	
}; 

/**
 * This method adds the author's profile photo if they have one to their message view (or entry).
 * 
 * @param {Object} row
 */
function appendProfilePhoto(row) {
	var msgEvent = row.msgEvent;
	if (msgEvent.profileUrl == undefined) {
		var defaultIDImage = null;
		defaultIDImage = Ti.UI.createImageView({
			image: '../user.png',
			backgroundColor:css.getColor0(),
			borderColor:css.getColor1(),
			top:0,
			left:0,
			width:50,
			height:50,
			clickName:'defaultIDImage'
		});
		row.add(defaultIDImage);
	}
	else {
		var userProfilePhoto = Ti.UI.createImageView({
			image: msgEvent.profileUrl,
			backgroundColor: css.getColor0(),
			borderColor: css.getColor1(),
			top:0,
			left:0,
			width:50,
			height:50,
			clickName:'photo'
		});
		row.add(userProfilePhoto);
	}
};

/**
 * This method builds the row collection based upon the incoming data message 
 * data from the web service.
 * 
 * @param {Object} msgEventList
 */
function buildRowCollection(msgEventList) {
	var i = 0;
	var msgEvent = null;
	var myDataRowList = [];
	// create a var to track the active row
	var currentRow = null;
	var currentRowIndex = null;
	var username = null;
	var location = null;
	var msgTitle = null;
	var ppUrl = 'http://philestore1.phreadz.com/_users/2d/04/e4/16/bennycrime/2010/02/19/bennycrime_1266618797_60.jpg';
	
	if (msgEventList != null) {
		Ti.API.info('buildRowCollection: size: ' + msgEventList.length);
		for (i=0; i<msgEventList.length; i++) {
			//
			// data fields
			//
			msgEvent = msgEventList[i];
		
			//
			// if alot of people deem this message as obscene, just stop showing it
			//		
			if (msgEvent.badCounter > 3) {
				continue;
			}
			
			
			Ti.API.info('buildRowCollection: msgEvent= ' + msgEvent);
			username = msgEvent.username;
			Ti.API.info('buildRowCollection: username: ' + username);
			location = msgEvent.location;
			Ti.API.info('buildRowCollection: location: ' + location);
			msgTitle = 'Posted by ' + username + ' on ' + location;
			Ti.API.info('buildRowCollection: title: ' + msgTitle);
			
			//
			// create table row
			//
			var row = Ti.UI.createTableViewRow({
				selectedBackgroundColor:'#fff',
				backgroundColor:css.getColor0(),
				height:0,
				width:'auto',
				borderColor:css.getColor2(),
				className:'MsgEventRow' + i,
				clickName:'row',
				msgEvent:msgEvent,
				hasChild:true,
				renderer:'messageRenderer.js'
			});
			Ti.API.info('buildRowCollection: row=' + row);
			
			//
			// build message body
			//	
			Ti.API.info('buildRowCollection: Adding profile pic');
			appendProfilePhoto(row);
			Ti.API.info('buildRowCollection: Done');
			var fontSize = 14;
			if (Titanium.Platform.name == 'android') {
				fontSize = 13;
			}
			Ti.API.info('buildRowCollection: Starting msg body');
			if (msgEvent.photoUrl == undefined) {
				Ti.API.info('buildRowCollection: BASIC msg body ...');
				appendMsgBody(row, fontSize);
			}
			else {
				Ti.API.info('buildRowCollection: PHOTO msg body ...');
				appendMsgBodyWithPhoto(row, fontSize);
			}
			
			var replyCounter = Ti.UI.createLabel({
				color: css.getColor3(),
				font: { fontSize: '10', fontWeight: 'bold', fontFamily: model.myFont },
				right: 0,
				top: 0,
				height: 20,
				width: 20,
				clickName: 'replyCounter',
				text: ''
			});
			if (msgEvent.commentCounter > 0) {
				replyCounter.text = '+' + msgEvent.commentCounter;
			} 
			Ti.API.info('buildRowCollection: replyCounter=' + replyCounter);
			row.add(replyCounter);
			// add row
			Ti.API.info('buildRowCollection: Adding row=' + row);
			myDataRowList.push(row);
		}
	}
	return myDataRowList;
};


/**
 * This method builds and adds all of the listeners to handle all of the user interaction
 * at the top the window.
 */
function buildPanelHeader(){
	var h = Ti.UI.createView({
		height: 50,
		width: 320,
		top: 0,
		borderColor: css.getColor2(),
		backgroundColor: css.getColor0()
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

	var displayName = null;	
	if (model.getCurrentUser() != null) {
		displayName = model.getCurrentUser().displayName;	
	}
	else {
		displayName = 'Anonymous';
	}
	var userLabel = Ti.UI.createLabel({
		text: displayName, 
		top: 0,
		width: 100,
		right: 10,
		textAlign: 'right',
		height: 20,
		font: { fontFamily: model.myFont, fontSize: 11, fontWeight: 'normal' },
		color: '#fff'
	});

	var countDisplay = '';
	if (model.getCurrentLake() != null) {
		countDisplay = model.getCurrentLake().localCount + ' Laker(s)';	
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
	
	var target = model.getCurrentLake();
	var label1 = undefined;
	if (target != undefined) {
		label1 = Ti.UI.createLabel({
			text: target.name,
			top: 15,
			left: 10,
			height: 25,
			font: { fontFamily: model.myFont, fontSize: 16, fontWeight: 'bold' },
			color: css.getColor4()
		});
		label1.addEventListener('click', function(e){
			Ti.App.fireEvent('GOTO_TAB', {
				nextTab: 1
			});
		});
	}
	else {
		label1 = Ti.UI.createLabel({
			text: "[ No Lake Found ... ]",
			top: 15,
			left: 10,
			height: 25,
			font: { fontFamily: model.myFont, fontSize: 16, fontWeight: 'bold' },
			color: css.getColor3()
		});
	}
	
	//
	// watch specific area button
	//
	var watchBtn = Ti.UI.createView({
		backgroundImage: '../commentButton.png',
		top: 7,
		right: 0,
		width: 50,
		clickName: 'watchBtn',
		height: 34
	});
	watchBtn.addEventListener('click', function(e) { 
		var w = Titanium.UI.createWindow({
			height: 420,
			backgroundColor: css.getColor0(),
			barColor: css.getColor0(),
			bottom: 0,
			title: 'Find some users ...',
			url:'searchLakes.js'
		});
		w.model = model;
		w.css = css;
		w.open();
	});
	
	//
	// submit new message button
	//
	newPostBtn = Ti.UI.createView({
		backgroundImage: '../commentButton.png',
		top: 7,
		right: 50,
		width: 50,
		clickName: 'newPostBtn',
		height: 34
	});
	newPostBtn.addEventListener('click', function(e){
		currentLake = model.getCurrentLake().name;
		var hint = "Buzz on '" + currentLake + "'?";
		
		//
		// window creation
		//
		var w = Titanium.UI.createWindow({
			height: 0,
			backgroundColor: css.getColor0(),
			barColor: css.getColor0(),
			bottom: 0,
			title: hint
		});
		
		w.model = model;
		w.css = css;
		w.picasa = picasa;
		
		//
		// create window open animation
		//
		var a = Titanium.UI.createAnimation();
		a.height = 420;
		a.duration = 300;
		
		//
		// label
		//
		var prompt1 = "To: " + currentLake;
		var msgLbl = Titanium.UI.createLabel({
			color: '#fff',
			text: prompt1,
			font: { fontFamily: model.myFont, fontWeight: 'bold' },
			top: 10,
			left: 20,
			width: 300,
			textAlign: 'right',
			height: 'auto'
		});
		w.add(msgLbl);
		
		//
		// textfield to enter message to post
		//
		var msgText = Titanium.UI.createTextField({
			hintText: hint,
			height: 35,
			width: 280,
			left: 20,
			top: 35,
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
		w.add(msgText);
		
		//
		// icon to indicate if the photo is loaded
		//
		var photoIndBtn = Ti.UI.createImageView({
			image: '../commentButton.png',
			backgroundColor: css.getColor0(),
			opacity: 0.25,
			top: 95,
			left: 40,
			width: 30,
			height: 34,
			clickName: 'addPhotoBtn'
		});
		w.add(photoIndBtn);
		composeMsgWinPhotoIndBtn = photoIndBtn;
		
		//
		// photo menu
		//
		var photoMenuList = [{
			title: 'Take Photo',
			color: '#fff',
			url: 'takePhoto.js'
		}, {
			title: 'Browse Existing',
			color: '#fff',
			url: 'browseGallery.js'
		}];
		var photoMenu = Titanium.UI.createTableView({
			data: photoMenuList,
			separatorColor: css.getColor2(),
			style: Titanium.UI.iPhone.TableViewStyle.PLAIN,
			top: 130,
			left: 20,
			height: 100,
			width: 280,
			color: '#fff',
			font: {
				fontFamily: model.myFont,
				fontWeight: 'normal'
			},
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
						composeMsgWinPhotoIndBtn.opacity = 1.0;
						composeMsgWinSubmitBtn.enabled = true;
					}
				});
				helperWin.open();
			}
		});
		w.add(photoMenu);
		
		//
		// switch label and component
		//	
		var prompt3 = "Post to my Facebook wall?";
		var msgLbl3 = Titanium.UI.createLabel({
			color: '#fff',
			text: prompt3,
			font: {
				fontFamily: model.myFont,
				fontWeight: 'bold'
			},
			top: 245,
			left: 20,
			width: 300,
			height: 'auto'
		});
		w.add(msgLbl3);
		
		var switchBtn = Titanium.UI.createSwitch({
			value: false,
			top: 275,
			left: 20
		});
		w.add(switchBtn);
		
		//
		// cancel button
		//
		var cancelBtn = Titanium.UI.createButton({
			title: 'Cancel',
			color: css.getColor0(),
			bottom: 10,
			right: 30,
			height: 30,
			width: 125
		});
		cancelBtn.addEventListener('click', function(){
			a.height = 0;
			w.close(a);
		});
		w.add(cancelBtn);
		
		//
		// submit button
		//
		var submitBtn = Titanium.UI.createButton({
			title: 'Submit',
			enabled: false,
			color: css.getColor0(),
			bottom: 10,
			left: 30,
			height: 30,
			width: 125
		});
		submitBtn.addEventListener('click', function(){
			submitBtn.enabled = false;
			cancelBtn.enabled = false;
			Ti.API.info('Start save message process ...');
			var rawImage = model.getPendingRawImage();
			var msgEvent = null;
			var myLocation = null;
			var restClient = null;
			
			//
			// uploading image and posting message
			//
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
				if (currentUser.profileUrl != null) {
					msgEvent.profileUrl = currentUser.profileUrl;
				}
				model.setPendingMsgEvent(msgEvent);
				Ti.API.info('Pending msgEvent: ' + msgEvent);
				//
				// upload photo
				//
				Ti.API.info('Starting 2-part process -- uploading photo ...');
				picasa.upload(model.getPicasaUser(), model.getPicasaPassword(), rawImage);
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
				if (currentUser.profileUrl != null) {
					msgEvent.profileUrl = currentUser.profileUrl;
				}
				restClient = new RestClient();
				restClient.postMessage(currentUser.id, msgEvent);
			}
		});
		w.add(submitBtn);
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
		w.add(postingInd);
		
		//
		// open window
		//
		w.open(a);
		composeMsgWin = w;
	});

	/*	
	var refreshBtn = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.REFRESH,
	});
	refresh.addEventListener('click', function() {
		
	});

	if (Ti.Platform.name == 'iPhone OS') {
		win.rightNavButton = refreshBtn;
	} 
	else {
		refreshBtn.top = 5;
		refreshBtn.title = "Refresh";
		refreshBtn.width = 200;
		tableView.top = 40;
		win.add(refreshBtn);
	}
	*/

	
	//
	// add items to table header
	//
	h.add(label0);
	h.add(label1);
	h.add(userLabel);
	h.add(userCountLbl);
	
	return h;
};

/**
 * This method is to update the data within the tableView (or datagrid) displaying the
 * scrolling message events to the user.
 * 
 * @param {Object} list
 */
function updateTableViewDisplay(list) {
	Ti.API.info('updateTableViewDisplay: # of msg(s): ' + (list != null ? list.length : 0));
	if (list.length > 0) {
		tableView.hide();
		initPreloader.show();
		var dataRowList = buildRowCollection(list);
		tableView.setData(dataRowList);
		initPreloader.hide();
		tableView.show();
	}
	else {
		if (!alertedUserOfNoMsgs) {
			alertedUserOfNoMsgs = true;
			alert('No messages found.');
		}
		if (tableView != null) {
			tableView.hide();
		}
		initPreloader.hide();
	}
};

/**
 * This method builds the message event table and adds the listeners for
 * managing the user clicking a message.
 */
function buildTableView(){
	var t = Titanium.UI.createTableView({
		separatorColor: css.getColor2(),
		style: Titanium.UI.iPhone.TableViewStyle.PLAIN,
		top: 55,
		filterAttribute: 'filter',
		backgroundColor: css.getColor0()
	});
	t.addEventListener('click', function(e){
		if (e.rowData.renderer) {
			var rendererWin = Titanium.UI.createWindow({
				url: e.rowData.renderer,
				title: e.rowData.title,
				backgroundColor: css.getColor0(),
				barColor: css.getColor0()
			});
			rendererWin.model = model;
			rendererWin.css = css;
			Ti.API.info('---------------> ' + e.rowData);
			Ti.API.info('---------------> ' + e.rowData.msgEvent);
			rendererWin.msgEvent = e.rowData.msgEvent;
			Titanium.UI.currentTab.open(rendererWin, {
				animated: true
			});
		}
	});
	return t;
};


/**
 * This is the initial entry to the functionality of this window
 */
function init() {
	//
	// initial app preloader
	//	
	initPreloader = Titanium.UI.createActivityIndicator({
		top: 150,
		left: 80,
		height: 80,
		width: 150,
		color: css.getColor2(),
		style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
	});
	initPreloader.font = {
		fontFamily: model.myFont,
		fontSize: 13,
		fontWeight: 'bold'
	};
	win.add(initPreloader);
	initPreloader.show();

	//////////////////////////////////////////
	//
	// Event Listeners
	//
	//////////////////////////////////////////

	Titanium.App.addEventListener('FOUND_LAST_BUCKET', function(e) {
		Ti.API.info('Got event FOUND_LAST_BUCKET ...');
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
	
	function check4MsgEvents() {
		var client = new RestClient();
		var activeLake = model.getCurrentLake();
		if (activeLake != null) {
			Ti.API.info('check4MsgEvent(): resourceId ---> ' + activeLake.id);
			client.getLocalMsgEvents(activeLake.id);
		}
		else {
			Ti.API.info('check4MsgEvent(): Not in a region to view messages!!!!');
			updateTableViewDisplay([]);
		}
	};
	
	Titanium.App.addEventListener('LOCAL_MSG_EVENTS_RECD', function(e) {
		Ti.API.info('Handling event -- LOCAL_MSG_EVENTS_RECD --> ' + e.result);
		//
		// update to data
		//
		if (headerView == null) {
			headerView = buildPanelHeader();
			win.add(headerView);
		}
		if (tableView != null) {
			win.remove(tableView);
		}
		tableView = buildTableView();
		win.add(tableView);
		updateTableViewDisplay(e.result);
	});
	
	//////////////////////////////////////////
	//
	// Build UI
	//
	//////////////////////////////////////////
	
	//	
	// start refresh timer
	//
	setInterval(check4MsgEvents, 120000);
	

	// get messages	
	check4MsgEvents();

};

//
// entry point
//
init();

