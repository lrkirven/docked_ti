Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../props/cssMgr.js');
Ti.include('../util/tools.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

/**
 * local variables
 */
var win = Ti.UI.currentWindow;
var model = win.model;
var msgEvent = win.msgEvent;
var localFlag = win.localFlag;

var newCommentBody = null;
var initStart = 0;
var commentVBox = null;

function check4MsgEvents() {
	var client = new RestClient();
	var activeLake = model.getCurrentLake();
	if (activeLake != null) {
		Ti.API.info('check4MsgEvent(): resKey ---> ' + activeLake.resKey);
		client.getLocalMsgEvents(activeLake.resKey);
	}
};

/**
 * This method create a view containing the poster's profile image (or photo).
 * 
 * @param {Object} m
 */
function appendProfilePhoto(m) {
	var p = null;
	if (m.profileUrl == undefined) {
		p = Base.createProfilePic(0, 0);
	}
	else {
		p = Ti.UI.createImageView({
			image: m.profileUrl,
			backgroundColor: CSSMgr.color0,
			borderColor: CSSMgr.color1,
			top: 0,
			left: 0,
			width: 50,
			height: 50,
			clickName: 'profile'
		});
	}
	win.add(p);
};

/**
 * This method creates a form for the user to post a new comment on
 * an existing message event.
 * 
 * @param {Object} m
 */
function createNewCommentsSection(m) {
	var editCommentBody = Ti.UI.createTableViewRow({
		top:20,
		left:0,
		// opacity:0.4,
		// backgroundColor:'transparent',
		backgroundColor:CSSMgr.color2,
		height:'auto',
		width:300,
		clickName:'commentBody'
	});
	
	var p = null;
	var u = model.getCurrentUser();
	if (u == null || !model.getUseFBProfilePic()) {
		p = Base.createProfilePic(0, 0);
	}
	else {
		p = Ti.UI.createImageView({
			image: model.getFBProfileUrl(),
			borderColor: CSSMgr.color1,
			top: 0,
			left: 0,
			width: 50,
			height: 50,
			clickName: 'profileImg'
		});
	}
	editCommentBody.add(p);
	//
	// textfield to enter comments
	//
	var msgText = Titanium.UI.createTextField({
		hintText:'Comments',
    	height:50,
    	width:250,
		left:50,
    	top:0,
    	font:{ fontFamily:model.myFont, fontWeight:'normal' },
    	textAlign:'left',
    	keyboardType:Titanium.UI.KEYBOARD_EMAIL,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
    	borderWidth:1,
    	borderRadius:5
	});
	editCommentBody.add(msgText);
	
	var addCommentBtn = Titanium.UI.createButton({
   		title:'Add Comment',
		color:CSSMgr.color0,
		backgroundColor:CSSMgr.color2,
  		font:{fontSize:15, fontFamily:model.myFont, fontWeight:'bold'},
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
  		width:150,
  		height:30,
		right:0,
		top:50
	});
	addCommentBtn.addEventListener('click', function(e) {
		var currentUser = model.getCurrentUser();
		var client = new RestClient();
		var lat = model.getUserLat();
		var lng = model.getUserLng();
		var newComment = { 
			resKey:msgEvent.resKey, 
			username:currentUser.displayName,
			response:msgText.value, 
			msgId:msgEvent.msgId, 
			lat:lat, 
			lng:lng
		};
		if (currentUser.profileUrl != null) {
			newComment.profileUrl = currentUser.profileUrl;
		}
		Ti.API.info('Adding comment with profile url ---> ' + newComment.profileUrl);
		client.postComment(currentUser.id, newComment);	
	});
	editCommentBody.add(addCommentBtn);
	
	return editCommentBody;
};

/**
 * This method creates a row to display previously added comments to the
 * posted message event.
 * 
 * @param {Object} commentInst
 * @param {Object} index
 */
function createExistingCommentRow(commentInst, index) {
	var fontSize = 13;
	var size = 75;
	
	var c0 = Ti.UI.createTableViewRow({
		// backgroundColor:'transparent',
		backgroundColor:CSSMgr.color0,
		left:0,
		height:'auto',
		width:340,
		touchEnabled:false,
		clickName:'oldCommentBody' + index
	});

	var p = null;	
	if (commentInst.profileUrl == null) {
		p = Base.createProfilePic(0, 0);
	}
	else {
		p = Ti.UI.createImageView({
			image: commentInst.profileUrl,
			backgroundColor: CSSMgr.color0,
			borderColor: CSSMgr.color1,
			top: 0,
			left: 0,
			width: 50,
			height: 50,
			clickName: 'photo'
		});
	}
	c0.add(p);
	
	var c1 = Ti.UI.createView({
		backgroundColor:CSSMgr.color0,
		borderColor:CSSMgr.color4,
		left:50,
		top:0,
		height:50,
		layout:'vertical',
		width:270,
		clickName:'oldCommentBody'
	});
	
	var comment = Ti.UI.createLabel({
		color:'#fff',
		font:{fontSize:fontSize, fontWeight:'normal', fontFamily:model.myFont},
		left:10,
		top:5,
		height:'auto',
		width:320,
		clickName:'comment',
		text:commentInst.response
	});
	c1.add(comment);
	
	var userLocale = Ti.UI.createLabel({
		color:CSSMgr.color2,
		font:{fontSize:10, fontWeight:'normal', fontFamily:model.myFont},
		left:10,
		top:5,
		height:25,
		textAlign:'left',
		width:220,
		clickName:'userLocale',
		text:(commentInst.username + ', ' + commentInst.timeDisplay)
	});
	c1.add(userLocale);
	c0.add(c1);
	
	return c0;
}; 

function createMsgTopic(m) {
	var fontSize = 13;
	var size = 90;
	var msgBody = Ti.UI.createView({
		backgroundColor:CSSMgr.color0,
		borderColor: CSSMgr.color2,
		left:50,
		top:0,
		layout:'vertical',
		height:size,
		width:270,
		clickName:'msgBody'
	});
	var mainMsg = m.messageData;
	/*
	 * add padding if necessary
	 */
	Ti.API.info('createMsgTopic(): message leng ---> ' + m.messageData.length);
	var comment = Ti.UI.createLabel({
		color: '#fff',
		font:{fontSize:fontSize, fontWeight:'normal', fontFamily:model.myFont},
		left:5,
		top:5,
		height:'auto',
		width:265,
		clickName:'comment',
		backgroundColor:CSSMgr.color0,
		text:mainMsg
	});
	msgBody.add(comment);
	
	var distVal = Tools.calcDist(model.getUserLat(), model.getUserLng(), m.lat, m.lng);
	var userLocale = Ti.UI.createLabel({
		color:CSSMgr.color2,
		font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
		height:'auto',
		left:5,
		top:3,
		textAlign:'left',
		width:msgBody.width,
		clickName:'userLocale',
		text:(m.username + ', ' + m.timeDisplay + ', ' + distVal)
	});
	msgBody.add(userLocale);
	win.add(msgBody);
	
	return size;
}; 

function createMsgTopicWithPhoto(m) {
	var fontSize = 13;
	var size = 230;
	var myWidth = 270;
	
	var msgBody = Ti.UI.createView({
		backgroundColor:CSSMgr.color0,
		left:50,
		top:0,
		layout:'vertical',
		height:size,
		width:myWidth,
		clickName:'msgBody'
	});
	var t = Ti.UI.create2DMatrix().rotate(-90);
	var msgPhoto = Ti.UI.createImageView({
		// image:m.photoUrl,
		backgroundImage:m.photoUrl,
		// backgroundColor:CSSMgr.color0,
		// borderColor:CSSMgr.color0,
		top:0,
		left:0,
		// width:'auto',
		width:150,
		height:150,
		transform: t,
		clickName:'msgPhoto'
	});
	msgPhoto.addEventListener('load', function(e){
		Ti.API.info('image loaded --> width=' + msgPhoto.width + ' height=' + msgPhoto.height);
		/*
		if (msgPhoto.width > msgPhoto.height) {
			var rot = Titanium.UI.create2DMatrix().rotate(-90);
			msgPhoto.transform = rot;
		}
		*/
	});
	msgBody.add(msgPhoto);
	

	
	var comment = Ti.UI.createLabel({
		color: '#fff',
		font:{fontSize:'12', fontWeight:'normal', fontFamily:model.myFont},
		left:0,
		top:0,
		height:'auto',
		width:265,
		clickName:'comment',
		text:m.messageData
	});
	msgBody.add(comment);
	
	var distVal = Tools.calcDist(model.getUserLat(), model.getUserLng(), m.lat, m.lng);
	var userLocale = Ti.UI.createLabel({
		color:CSSMgr.color2,
		font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
		height:'auto',
		left:0,
		top:2,
		textAlign:'left',
		width:msgBody.width,
		clickName:'userLocale',
		text:(m.username + ', ' + m.timeDisplay + ', ' + distVal)
	});
	msgBody.add(userLocale);
	Ti.API.info('userLocale x --> ' + userLocale.height);
	win.add(msgBody);
	
	/*
	var rotateBtn = Titanium.UI.createButton({
   		title:'Rotate It!',
		color:CSSMgr.color2,
		backgroundColor:CSSMgr.color0,
  		font:{fontSize:13, fontFamily:model.myFont, fontWeight:'bold'},
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		right:0,
		top:0,
  		width:100,
  		height:30,
	});
	rotateBtn.addEventListener('click', function(e){
		var t = Ti.UI.create2DMatrix();
		var spin = Titanium.UI.createAnimation();
		t = t.rotate(-90);
		spin.transform = t;
		spin.duration = 10;
		msgPhoto.animate(spin);
	});
	win.add(rotateBtn);
	*/
	
	return size;
	
}; 

/**
 * This method updates the display of the renderer based upon
 * incoming new data.
 */
function updateDisplayList() {
	var topStart = initStart;
	
	if (commentVBox != null) {
		Ti.API.info('updateDisplayList: Removing commentVBox ...');
		win.remove(commentVBox);
	}

	// list of comment components	
	var commentList = [];
	
	Ti.API.info('updateDisplayList: counter: ' + msgEvent.commentCounter);
		
	if (msgEvent.commentCounter > 0) {
		for (i=0; i<msgEvent.commentCounter; i++) {
			var commentInst = msgEvent.comments[i];
			var r = createExistingCommentRow(commentInst, i);
			commentList.push(r);
		}
	}
	
	//
	// component for user to add new comments section
	//
	if (localFlag) {
		var last = createNewCommentsSection(msgEvent);
		commentList.push(last);
	}
	
	commentVBox = Titanium.UI.createTableView({
		scrollable:true,
		moving:false,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		data:commentList,
		separatorColor:CSSMgr.color0,
		top:topStart,
		left:0,
		height:240,
		filterAttribute:'filter'
	});
	commentVBox.backgroundImage = '../images/Background.png';
	win.add(commentVBox);
	
	var reportAbuseBtn = Titanium.UI.createButton({
   		title:'Report Abuse',
		color:CSSMgr.color2,
		backgroundColor:CSSMgr.color0,
  		font:{fontSize:12, fontFamily:model.myFont, fontWeight:'bold'},
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		width:100,
  		height:30,
		bottom:0,
		right:0
	});
	reportAbuseBtn.addEventListener('click', function(e) {
		var w = Titanium.UI.createWindow({
			url:'reportAbuseList.js',
			model:win.model,
			msgEvent:msgEvent,
			backgroundColor:CSSMgr.color0,
   			barColor:CSSMgr.color0,
			barImage: '../images/Header.png'
		});
		Titanium.UI.currentTab.open(w, {animated:true});
	});
	win.add(reportAbuseBtn);
};

/**
 * This method to handle response to the creation of new comment.
 * 
 * @param {Object} e
 */
Ti.App.addEventListener('NEW_COMMENT_ADDED', function(e) {
	if (e.status == 0) {
		// bump counter
		msgEvent.commentCounter++;
		// adding recently added comment to list
		if (msgEvent.comments == null) {
			msgEvent.comments = [];
		}
		// add comment to list
		msgEvent.comments.push(e.newComment);
		// refresh display
		updateDisplayList();
		check4MsgEvents();
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);	
	}
});


/**
 * Initial entry to renderer
 */
function init() {
	var user = model.getCurrentUser();
	if (user != null) {
		Ti.API.info('messageRenderer.init(): Current User :: ' + user.displayName);
	}
	else {
		Ti.API.info('messageRenderer.init(): Anonymous User');
	}
	
	appendProfilePhoto(msgEvent);
	if (msgEvent.photoUrl == null) {
		initStart = createMsgTopic(msgEvent);
	}
	else {
		initStart = createMsgTopicWithPhoto(msgEvent);
	}
	
	var showOnMapBtn = Titanium.UI.createButton({
   		title:'Map It',
		color:CSSMgr.color2,
		backgroundColor:CSSMgr.color0,
  		font:{fontSize:15, fontFamily:model.myFont, fontWeight:'bold'},
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
  		width:150,
  		height:30
	});
	showOnMapBtn.addEventListener('click', function(e) {
		Ti.API.info('PopupUp window');
		var buzzOnMapWin = Titanium.UI.createWindow({
			url:'buzzOnMapViewer.js',
			barImage:'../images/Header.png',
			localFlag:true,
			buzzMsg:msgEvent,
			backgroundColor:CSSMgr.color0,
			barColor:CSSMgr.color0,
			model:model
		});
		Titanium.UI.currentTab.open(buzzOnMapWin, {
			animated: true
		});
	});
	win.setRightNavButton(showOnMapBtn);
	
	
};

//
// Main processing
//
init();
updateDisplayList();

