Ti.include('../model/modelLocator.js');
Ti.include('../client/picasaClient.js');
Ti.include('../client/restClient.js');
Ti.include('../util/tea.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var db = win.db;
var css = win.css;
var continueBtn = null;
var displayNameText = null;

/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {

	var panel = Ti.UI.createView({ 
		backgroundColor:'#cccccc',
		top:30,
		left:10,
		width:300,
		height:300,
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

	var lbl = Titanium.UI.createLabel({
		color: css.getColor0(),
		text: 'Registration is complete. Please update your display name to the community: ',
		font: { fontFamily: model.myFont, fontSize:15 },
		top: 80,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl);

	displayNameText = Titanium.UI.createTextField({
		height: 40,
		width: 280,
		left: 10,
		top: 125,
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		textAlign: 'left',
		keyboardType: Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		borderWidth: 2,
		borderRadius: 1,
	});		
	
	panel.add(displayNameText);
	
	//
	// submit button
	//
	continueBtn = Titanium.UI.createButton({
		title: 'Continue',
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
	continueBtn.addEventListener('click', function() {
		var str = displayNameText.value;	
		if (str != model.getCurrentUser().displayName) {
			var client = new RestClient();
			var user = model.getCurrentUser();
			client.updateDisplayName(user.id, msgEvent);	
		}
	});
	
	if (model.getCurrentUser() != null && model.getCurrentUser().displayName != null) {
		displayNameText.value = model.getCurrentUser().displayName;
		displayNameText.focus();
		continueBtn.enabled = true;	
	}
	else {
		continueBtn.enabled = false;	
	}
	panel.add(continueBtn);
	win.add(panel);
};


/**
 * Initialize the form
 */
function init() {
	win.addEventListener("open", function(event, type) {
    	displayNameText.focus();
	});
	buildForm();
};

//
// initial entry
//
init();
