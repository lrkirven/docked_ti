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
var saveBtn = null;
var displayNameText = null;

Titanium.App.addEventListener('UPDATED_DISPLAY_NAME', function(e) { 
	if (e.status == 0) {
		Tools.reportMsg(Msgs.APP_NAME, Msgs.PREFS_UPDATED);	
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);
	}
});

/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {

	var panel = Ti.UI.createView({ 
		backgroundColor:CSSMgr.color2,
		top:10,
		bottom:10,
		left:10,
		width:300,
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

	var lbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Display name to \'Docked\' Community: ',
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
		top: 105,
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		textAlign: 'left',
		keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		borderWidth: 2,
		borderRadius: 1
	});	
	displayNameText.addEventListener('change', function() {
		var name = displayNameText.value;
		if (name != null && name.length > 0) {
			saveBtn.enabled = true;	
			if (name.length > 15) {
				name = name.substr(0, 15);
				displayNameText.value = name;
				Tools.reportMsg(Msgs.APP_NAME, 'Your display name is too long (<25).');	
				return;				
			}
		}
		else {
			saveBtn.enabled = false;
		}
	});
	panel.add(displayNameText);
	
	//
	// submit button
	//
	saveBtn = Titanium.UI.createButton({
		title: 'Save',
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
	saveBtn.addEventListener('click', function() {
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
		saveBtn.enabled = true;	
	}
	else {
		saveBtn.enabled = false;	
	}
	panel.add(saveBtn);
	win.add(panel);
	win.backgroundImage = '../images/Background.png';
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
