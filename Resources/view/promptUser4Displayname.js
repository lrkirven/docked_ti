Ti.include('../utilcommon.js');
Ti.include('../util/msgs.js');
Ti.include('../util/tea.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var db = win.db;
var continueBtn = null;
var displayNameText = null;

/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {

	var panel = Ti.UI.createView({ 
		backgroundColor:CSSMgr.color2,
		top:30,
		left:10,
		width:300,
		height:300,
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

	var lbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
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
		borderRadius: 1
	});	
	displayNameText.addEventListener('change', function() {
		var name = displayNameText.value;
		if (name != null && name.length > 0) {
			continueBtn.enabled = true;	
			if (name.length > Common.MAX_DISPLAY_NAME_LENGTH) {
				name = name.substr(0, Common.MAX_DISPLAY_NAME_LENGTH);
				displayNameText.value = name;
			}
		}
		else {
			continueBtn.enabled = false;
		}
	});
	panel.add(displayNameText);
	
	//
	// submit button
	//
	continueBtn = Titanium.UI.createButton({
		title: 'Continue',
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
	continueBtn.addEventListener('click', function() {
		var str = displayNameText.value;	
		if (str != model.getCurrentUser().displayName) {
			var client = new RestClient();
			var user = model.getCurrentUser();
			client.updateDisplayName(user.id, str);	
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
