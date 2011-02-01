Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');
Ti.include('../util/tools.js');

/**
 * local variables
 */
var win = Ti.UI.currentWindow;
var model = win.model;
var msgEvent = win.msgEvent;
var css = win.css;
var newCommentBody = null;
var initStart = 0;
var commentVBox = null;

Ti.API.info('Entering messageRenderer --> msgEvent=' + this.msgEvent);
Ti.API.info('Entering messageRenderer --> model=' + this.model);

function check4MsgEvents() {
	var client = new RestClient();
	var activeLake = model.getCurrentLake();
	if (activeLake != null) {
		Ti.API.info('check4MsgEvent(): resourceId ---> ' + activeLake.id);
		client.getLocalMsgEvents(activeLake.id);
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
		p = Ti.UI.createImageView({
			image: '../user.png',
			backgroundColor: css.getColor0(),
			borderColor: css.getColor1(),
			top: 0,
			left: 0,
			width: 50,
			height: 50,
			clickName: 'defaultIDImage'
		});
	}
	else {
		p = Ti.UI.createImageView({
			image: m.profileUrl,
			backgroundColor: css.getColor0(),
			borderColor: css.getColor1(),
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
		backgroundColor:css.getColor0(),
		top:20,
		left:0,
		height:100,
		width:300,
		clickName:'commentBody'
	});
	
	var p = null;
	var u = model.getCurrentUser();
	if (u == null || !model.getUseFBProfilePic()) {
		p = Ti.UI.createImageView({
			image: '../user.png',
			backgroundColor: css.getColor0(),
			borderColor: css.getColor1(),
			top: 0,
			left: 0,
			width: 50,
			height: 50,
			clickName: 'defaultProfileImg'
		});
	}
	else {
		p = Ti.UI.createImageView({
			image: model.getFBProfileUrl(),
			backgroundColor: css.getColor0(),
			borderColor: css.getColor1(),
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
    	width:260,
		left:50,
    	top:0,
    	font:{ fontFamily:model.myFont, fontWeight:'normal' },
    	textAlign:'left',
    	keyboardType:Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
    	borderWidth:1,
    	borderRadius:5
	});
	editCommentBody.add(msgText);
	
	var addCommentBtn = Titanium.UI.createButton({
   		title:'Post Comment',
		color:css.getColor2(),
		backgroundColor:css.getColor4(),
  		font:{fontSize:15, fontFamily:model.myFont, fontWeight:'bold'},
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
  		width:150,
  		height:30,
		right:10,
		top:50
	});
	addCommentBtn.addEventListener('click', function(e) {
		var currentUser = model.getCurrentUser();
		var client = new RestClient();
		var lat = model.getUserLat();
		var lng = model.getUserLng();
		var newComment = { resourceId:msgEvent.resourceId, username:currentUser.displayName,
			response:msgText.value, msgId:msgEvent.msgId, 
			lat:lat, lng:lng
		};
		if (currentUser.profileUrl != null) {
			newComment.profileUrl = currentUser.profileUrl;
		}
		else {
			newComment.profileUrl = '../user.png';
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
	var profileUrl = '../user.png'; 

	//
	// check if you has a profile Url
	//	
	if (commentInst.profileUrl != null) {
		profileUrl = commentInst.profileUrl;
	}
	var size = 75;
	var c0 = Ti.UI.createTableViewRow({
		backgroundColor:css.getColor0(),
		left:0,
		height:'auto',
		width:340,
		touchEnabled:false,
		clickName:'oldCommentBody' + index
	});
	
	var p = Ti.UI.createImageView({
		image: profileUrl,
		backgroundColor:css.getColor0(),
		borderColor:css.getColor1(),
		top:0,
		left:0,
		width:50,
		height:50,
		clickName:'photo'
	});
	c0.add(p);
	
	var c1 = Ti.UI.createView({
		backgroundColor:css.getColor0(),
		borderColor:css.getColor4(),
		left:50,
		top:0,
		height:50,
		layout:'vertical',
		width:260,
		clickName:'oldCommentBody'
	});
	
	var comment = Ti.UI.createLabel({
		color:'#fff',
		font:{fontSize:fontSize, fontWeight:'normal', fontFamily:model.myFont},
		left:10,
		top:5,
		height:'auto',
		width:260,
		clickName:'comment',
		text:commentInst.response
	});
	c1.add(comment);
	
	var userLocale = Ti.UI.createLabel({
		color:css.getColor2(),
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
	var size = 80;
	var msgBody = Ti.UI.createView({
		backgroundColor:css.getColor4(),
		left:50,
		top:0,
		layout:'vertical',
		height:'auto',
		width:300,
		clickName:'msgBody'
	});
	var comment = Ti.UI.createLabel({
		color:'#fff',
		font:{fontSize:fontSize, fontWeight:'normal', fontFamily:model.myFont},
		left:10,
		top:0,
		height:50,
		width:220,
		clickName:'comment',
		text:m.messageData
	});
	msgBody.add(comment);
	
	var userLocale = Ti.UI.createLabel({
		color:css.getColor2(),
		font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
		left:10,
		bottom:5,
		height:20,
		textAlign:'left',
		width:220,
		clickName:'userLocale',
		text:(m.username + ', ' + m.timeDisplay)
	});
	msgBody.add(userLocale);
	win.add(msgBody);
	
	return size;
}; 

function createMsgTopicWithPhoto(m) {
	var fontSize = 13;
	var size = 230;
	var myWidth = 260;
	
	var msgBody = Ti.UI.createView({
		backgroundColor:css.getColor4(),
		left:50,
		top:0,
		layout:'vertical',
		height:'auto',
		width:myWidth,
		clickName:'msgBody'
	});
	var msgPhoto = Ti.UI.createImageView({
		image:m.photoUrl,
		backgroundColor:css.getColor0(),
		borderColor:css.getColor0(),
		top:10,
		left:10,
		// width:'auto',
		width:size,
		height:150,
		clickName:'msgPhoto'
	});
	msgBody.add(msgPhoto);
	
	var comment = Ti.UI.createLabel({
		color:'#fff',
		font:{fontSize:'12', fontWeight:'normal', fontFamily:model.myFont},
		left:10,
		top:10,
		height:20,
		width:size,
		clickName:'comment',
		text:m.messageData
	});
	msgBody.add(comment);
	
	var userLocale = Ti.UI.createLabel({
		color:css.getColor2(),
		font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
		left:10,
		top:5,
		bottom:2,
		height:20,
		textAlign:'left',
		width:300,
		clickName:'userLocale',
		text:(m.username + ', ' + m.timeDisplay)
	});
	msgBody.add(userLocale);
	Ti.API.info('userLocale x --> ' + userLocale.height);
	win.add(msgBody);
	
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
	var last = createNewCommentsSection(msgEvent);
	commentList.push(last);
	
	commentVBox = Titanium.UI.createTableView({
		data:commentList,
		separatorColor:css.getColor0(),
		style:Titanium.UI.iPhone.TableViewStyle.PLAIN,
		top:topStart,
		filterAttribute:'filter',
		backgroundColor:css.getColor0()
	});
	win.add(commentVBox);
};


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
			Tools.reportMsg(model.getAppName(), e.errorMsg);	
		}
	});
	
	appendProfilePhoto(msgEvent);
	if (msgEvent.photoUrl == null) {
		initStart = createMsgTopic(msgEvent);
	}
	else {
		initStart = createMsgTopicWithPhoto(msgEvent);
	}
};

//
// Main processing
//
init();
updateDisplayList();

