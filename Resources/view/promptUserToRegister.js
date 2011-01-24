Ti.include('../model/modelLocator.js');
Ti.include('../client/picasaClient.js');
Ti.include('../client/restClient.js');
Ti.include('../util/tea.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var db = win.db;
var css = win.css;
var composeMsgWinPhotoIndBtn = null;
var post2FB = false;

function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {

	var panel = Ti.UI.createView({ 
		backgroundColor:'#cccccc',
		top:100,
		left:10,
		width:300,
		height:200,
		borderRadius:20,
		clickName:'bg'
	});

	
	var defaultIDImage = Ti.UI.createImageView({
		image: '../user.png',
		backgroundColor:css.getColor0(),
		borderColor:css.getColor2(),
		top:10,
		left:20,
		width:50,
		height:50,
		clickName:'defaultIDImage'
	});
	panel.add(defaultIDImage);
	
	var appName = Titanium.UI.createLabel({
		color: css.getColor0(),
		text: model.getAppName(),
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
	
	win.add(panel);
	
	var laterBtn = Titanium.UI.createButton({
		title: 'Later',
		enabled: true,
		color: css.getColor0(),
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
		title: 'Register',
		enabled: true,
		color: css.getColor0(),
		systemButton: Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE,
		selectedColor:css.getColor2(),
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

	/*	
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
	*/
};

function performExit() {
	Ti.App.removeEventListener('NEW_MSG_EVENT_ADDED', handleNewMsgPosted);
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
