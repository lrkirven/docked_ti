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


/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {

	var panel = Ti.UI.createView({ 
		backgroundColor:CSSMgr.color2,
		top:50,
		left:10,
		width:300,
		height:250,
		borderRadius:20,
		clickName:'bg'
	});

	var icon = Base.createIcon(15, 15);
	panel.add(icon);
	
	
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
	
	Ti.API.info('buildForm(): ----> form item #1');
	
	var lbl0 = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'You are outside of a known \'Docked\' water community. Select the \'Visit\' option to visit a nearby \'Docked\' community to see activity at another community.',
		font: { fontFamily: model.myFont, fontSize:15 },
		top: 80,
		left: 20,
		width: 270,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl0);

	//
	// submit button
	//
	var closeBtn = Titanium.UI.createButton({
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
