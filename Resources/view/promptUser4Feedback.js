Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/tools.js');
Ti.include('../util/tea.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var db = win.db;
var submitBtn = null;
var feedbackText = null;

/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {

	var panel = Ti.UI.createView({ 
		backgroundColor:CSSMgr.color2,
		top:20,
		left:10,
		width:300,
		height:280,
		borderRadius:20,
		clickName:'bg'
	});
	
	if (model.getUseFBProfilePic() && model.getFBProfileUrl() != null) {
		var myProfileUrl = model.getFBProfileUrl();
		Ti.API.info('myProfileUrl :: ' + myProfileUrl);
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

	var lbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Please provide feedback to improve the \'Docked\' application:',
		font: { fontFamily:model.myFont, fontSize:15, fontWeight:'bold' },
		top: 80,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl);

	feedbackText = Titanium.UI.createTextArea({
		height:140,
		width:280,
		left:10,
		top:125,
		font:{ fontSize:15, fontFamily: model.myFont, fontWeight: 'normal' },
		appearance:Titanium.UI.KEYBOARD_APPEARANCE_ALERT,	
		keyboardType:Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderWidth:2,
		borderColor:CSSMgr.color0,
		borderRadius:5
	});
	feedbackText.addEventListener('change', function() {
		var comment = feedbackText.value;
		if (comment != null && comment.length > 0) {
			if (comment.length > Common.MAX_MSG_LENG) {
				comment = comment.substr(0, Common.MAX_MSG_LENG);
				feedbackText.value = comment;
				return;
			}
			submitBtn.enabled = true;	
		}
		else {
			submitBtn.enabled = false;
		}
	});
	panel.add(feedbackText);
	
	//
	// submit button
	//
	submitBtn = Titanium.UI.createButton({
		title: 'Submit',
		enabled: true,
		color: CSSMgr.color0,
		systemButton: Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE,
		selectedColor:CSSMgr.color2,
		bottom: 20,
		borderRadius:0,
		right: 20,
		height: 30,
		width: 100
	});
	submitBtn.addEventListener('click', function() {
		var str = feedbackText.value;	
		var client = new RestClient();
		var user = model.getCurrentUser();
		client.addFeedback(user.id, str);	
	});
	
	submitBtn.enabled = false;	
	win.add(submitBtn);
	// win.setRightNavButton(submitBtn);
	win.add(panel);
};


/**
 * Initialize the form
 */
function init() {
	buildForm();
	win.addEventListener('open', function(event) {
    	feedbackText.focus();
	});
	win.backgroundImage = '../images/Background.png';
	win.open();	
};

//
// initial entry
//
init();
