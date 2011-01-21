Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

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

Ti.API.info('Entering messageRenderer --> ' + this.msgEvent);

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
 * This method creates a row to display previously added comments to the
 * posted message event.
 * 
 * @param {Object} commentInst
 * @param {Object} index
 */
function createExistingCommentRow(commentInst, index) {
	var fontSize = 13;
	// var profileUrl = 'http://philestore1.phreadz.com/_users/2d/04/e4/16/bennycrime/2010/02/19/bennycrime_1266618797_60.jpg';
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
		left:60,
		top:0,
		height:'auto',
		layout:'vertical',
		width:300,
		clickName:'oldCommentBody'
	});
	
	var comment = Ti.UI.createLabel({
		color:'#fff',
		font:{fontSize:fontSize, fontWeight:'normal', fontFamily:model.myFont},
		left:10,
		top:0,
		height:'auto',
		width:250,
		clickName:'comment',
		text:commentInst.response
	});
	c1.add(comment);
	
	var userLocale = Ti.UI.createLabel({
		color:css.getColor2(),
		font:{fontSize:10, fontWeight:'normal', fontFamily:model.myFont},
		left:10,
		top:0,
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
	var size = 240;
	var myWidth = 260;
	
	var msgBody = Ti.UI.createView({
		backgroundColor:css.getColor4(),
		left:50,
		top:0,
		layout:'vertical',
		height:size,
		width:myWidth,
		clickName:'msgBody'
	});
	var msgPhoto = Ti.UI.createImageView({
		image:m.photoUrl,
		backgroundColor:css.getColor4(),
		borderColor:css.getColor1(),
		top:10,
		left:10,
		width:'auto',
		height:150,
		clickName:'msgPhoto'
	});
	msgBody.add(msgPhoto);
	
	var comment = Ti.UI.createLabel({
		color:'#fff',
		font:{fontSize:'12', fontWeight:'normal', fontFamily:model.myFont},
		left:10,
		top:10,
		height:'auto',
		width:250,
		clickName:'comment',
		text:m.messageData
	});
	msgBody.add(comment);
	
	var userLocale = Ti.UI.createLabel({
		color:css.getColor2(),
		font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
		left:10,
		top:5,
		height:'auto',
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
	Ti.API.info('messageRendererReadOnly.init(): ' + msgEvent);
	
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

