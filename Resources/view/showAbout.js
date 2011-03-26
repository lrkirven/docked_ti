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
var registerBtn = null;
var displayNameText = null;
var enteredDisplayName = null;
var emailAddrText = null;
var enteredEmailAddr = null;
var preloader = null;


/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {

	Ti.API.info('buildForm(): Creating registration form ...');
	
	var panel = Ti.UI.createView({ 
		backgroundColor:CSSMgr.color2,
		top:50,
		left:10,
		width:300,
		height:350,
		borderRadius:20,
		clickName:'bg'
	});

	var icon = Base.createIcon(15, 15);
	panel.add(icon);
	
	
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
	
	Ti.API.info('buildForm(): ----> form item #1');
	
	var lbl0 = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Version: ',
		font: { fontFamily: model.myFont, fontSize:15, fontWeight:'bold' },
		top: 80,
		left: 0,
		width: 150,
		textAlign: 'right',
		height: 40 
	});
	panel.add(lbl0);

	var version = Titanium.UI.createLabel({
		height: 40,
		width: 150,
		left: 155,
		top: 80,
		font: { fontFamily: model.myFont, fontSize:15, fontWeight: 'normal' },
		textAlign: 'left',
		text: '1.0.1'
	});	
	panel.add(version);

	Ti.API.info('buildForm(): ----> form item #2');
	
	var lbl1 = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Release Date: ',
		font: { fontFamily: model.myFont, fontSize:15, fontWeight:'bold' },
		top: 105,
		left: 0,
		width: 150,
		textAlign: 'right',
		height: 40 
	});
	panel.add(lbl1);

	var relDate = Titanium.UI.createLabel({
		height: 40,
		width: 150,
		left: 155,
		top: 105,
		font: { fontFamily: model.myFont, fontSize:15, fontWeight: 'normal' },
		textAlign: 'left',
		text: 'Mar 25, 2011'
	});	
	panel.add(relDate);
	
	closeBtn = Titanium.UI.createButton({
		title: 'Close',
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
	closeBtn.addEventListener('click', function() {
		win.close();
	});
	
	panel.add(closeBtn);
	win.add(panel);
};


/**
 * Initialize the form
 */
function init() {
	buildForm();
	win.backgroundImage = '../images/Background.png';	
};

//
// initial entry
//
init();
