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
	
	Ti.API.info('buildForm(): ----> form item #1');
	
	Ti.API.info('buildForm(): ----> form item #2');
	
	var tip1 = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: '\u2022 Use state abbrev. when possible (i.e TX <keyword>)',
		font: { fontFamily: model.myFont, fontSize:15, fontWeight:'normal' },
		top: 70,
		left: 0,
		width: 270,
		textAlign: 'right',
		height: 70 
	});
	panel.add(tip1);

	var tip2 = Titanium.UI.createLabel({
		height: 40,
		width: 270,
		left: 10,
		top: 135,
		font: { fontFamily: model.myFont, fontSize:15, fontWeight: 'normal' },
		textAlign: 'left',
		text: '\u2022 Use whole words when possible'
	});	
	panel.add(tip2);
	
	var tip3 = Titanium.UI.createLabel({
		height: 70,
		width: 270,
		left: 10,
		top: 185,
		font: { fontFamily: model.myFont, fontSize:15, fontWeight: 'normal' },
		textAlign: 'left',
		text: '\u2022 Don\'t use proper names. Avoid common names such \'lake\' or \'beach\''
	});	
	panel.add(tip3);
	
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
