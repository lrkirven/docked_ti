Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/tea.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var db = win.db;
var composeMsgWinPhotoIndBtn = null;
var post2FB = false;

/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {

	var panel = Ti.UI.createView({ 
		backgroundColor:CSSMgr.color2,
		top:122,
		left:10,
		width:300,
		height:200,
		borderRadius:20,
		clickName:'bg'
	});

	/*
	var defaultIDImage = Base.createProfilePic(10, 20);
	panel.add(defaultIDImage);
	*/
	
	var titlePic = Ti.UI.createImageView({
		image: '../images/Header.png',
		borderColor:CSSMgr.color2,
		top: -2,
		left: -5,
		width:320,
		height:50,
		clickName:'titleImage'
	});	
	panel.add(titlePic);
	
	var lbl0 = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: "Become a member of the 'Docked' community and communicate with water enthusiasts across the USA. ",
		font: { fontFamily: model.myFont, fontSize: 14, fontWeight: 'bold' },
		top: 70,
		left: 10,
		width: 280,
		textAlign: 'center',
		height: 'auto'
	});
	panel.add(lbl0);
	
	/*
	var appName = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: Msgs.APP_NAME,
		font: { fontFamily: model.myFont, fontSize:25, fontWeight: 'bold' },
		top: 10,
		right: 20,
		width: 280,
		textAlign: 'right',
		shadowColor:'#eee',
		shadowOffset:{x:0,y:1},
		height: 'auto'
	});
	panel.add(appName);
	*/
	
	win.add(panel);
	
	var laterBtn = Titanium.UI.createButton({
		title: 'Later',
		enabled: true,
		color: CSSMgr.color0,
		systemButton: Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		bottom: 10,
		borderRadius:0,
		left: 20,
		height: 30,
		width: 100
	});
	laterBtn.addEventListener('click', function() {
		Titanium.App.fireEvent('PROMPT_USER_TO_REGISTER_COMPLETE', { registerFlag:false });
	});	
	
	//
	// submit button
	//
	var registerBtn = Titanium.UI.createButton({
		title: Msgs.SIGN_UP,
		enabled: true,
		color: CSSMgr.color0,
		systemButton: Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE,
		selectedColor:CSSMgr.color2,
		bottom: 10,
		borderRadius:0,
		right: 20,
		height: 30,
		width: 100
	});
	registerBtn.addEventListener('click', function() {
		Titanium.App.fireEvent('PROMPT_USER_TO_REGISTER_COMPLETE', { registerFlag:true });
	});
	panel.add(registerBtn);
	panel.add(laterBtn);

	win.backgroundImage = '../images/Background.png';
};

/**
 * Initialize the form
 */
function init() {
	Ti.API.info('XML :: ' + Titanium.XML);
	buildForm();
};

//
// initial entry
//
init();
