Ti.include('../util/tools.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/picasaClient.js');
Ti.include('../client/restClient.js');
Ti.include('../util/tea.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var db = win.db;
var css = win.css;
var registerBtn = null;
var displayNameText = null;
var enteredDisplayName = null;
var emailAddrText = null;
var enteredEmailAddr = null;
var preloader = null;


Titanium.App.addEventListener('USER_REGISTERED', function(e) { 
	preloader.hide();
});

/**
 * This method lays out the UI format and sets up the event listeners to 
 * handle user interaction.
 */
function buildForm() {

	Ti.API.info('buildForm(): Creating registration form ...');
	
	var panel = Ti.UI.createView({ 
		backgroundColor:'#cccccc',
		top:50,
		left:10,
		width:300,
		height:350,
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
	
	Ti.API.info('buildForm(): ----> form item #1');
	
	var lbl0 = Titanium.UI.createLabel({
		color: css.getColor0(),
		text: 'Email Address: ',
		font: { fontFamily: model.myFont, fontSize:15 },
		top: 80,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl0);

	emailAddrText = Titanium.UI.createTextField({
		height: 40,
		width: 280,
		left: 10,
		top: 105,
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		textAlign: 'left',
		keyboardType: Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		borderWidth: 2,
		borderRadius: 1
	});	
	emailAddrText.addEventListener('change', function() {
		var email = emailAddrText.value;
		if (email != null && email.length > 0) {
			if (email.length > 256) {
				email = email.substr(0, 256);
				emailAddrText.value = email;
				enteredEmailAddr = emailAddrText.value;
				Ti.API.info('buildForm(): Applying limit :: ' + email);
			}
			else {
				enteredEmailAddr = email;
			}
		}
		else {
			enteredEmailAddr = null;
		}
		checkRegData();
	});
	panel.add(emailAddrText);

	Ti.API.info('buildForm(): ----> form item #2');
	
	var lbl1 = Titanium.UI.createLabel({
		color: css.getColor0(),
		text: 'Display Name: ',
		font: { fontFamily: model.myFont, fontSize:15 },
		top: 170,
		left: 10,
		width: 280,
		textAlign: 'left',
		height: 'auto'
	});
	panel.add(lbl1);

	displayNameText = Titanium.UI.createTextField({
		height: 40,
		width: 280,
		left: 10,
		top: 195,
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
			if (name.length > 50) {
				name = name.substr(0, 50);
				displayNameText.value = name;
				enteredDisplayName = displayNameText.value;
				Ti.API.info('buildForm(): Applying limit :: ' + name);
			}
			else {
				enteredDisplayName = displayNameText.value;
			}
		}
		else {
			enteredDisplayName = null;
		}
		checkRegData();
	});
	panel.add(displayNameText);
	
	//
	// submit button
	//
	registerBtn = Titanium.UI.createButton({
		title: 'Register',
		enabled: false,
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
		if (preloader != null) {
			preloader.show();
		}
		var str = displayNameText.value;	
		var client = new RestClient();
		client.registerUser(enteredEmailAddr, enteredDisplayName, model.getPW3());	
	});
	
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
	
	function checkRegData() {
		Ti.API.info('checkRegData(): enteredEmailAddr=' + enteredEmailAddr + '   enteredDisplayName=' + enteredDisplayName);
		if (enteredEmailAddr != null && enteredEmailAddr.length > 0 && enteredDisplayName != null && enteredDisplayName.length > 0) {
			registerBtn.enabled = true;
		}
		else {
			registerBtn.enabled = false;
		}
	}
	
	if (model.getCurrentUser() != null && model.getCurrentUser().displayName != null) {
		displayNameText.value = model.getCurrentUser().displayName;
		displayNameText.focus();
		registerBtn.enabled = true;	
	}
	else {
		registerBtn.enabled = false;	
	}
	panel.add(registerBtn);
	panel.add(laterBtn);
	win.add(panel);
};


/**
 * Initialize the form
 */
function init() {
	win.addEventListener("open", function(event, type) {
    	emailAddrText.focus();
	});
	buildForm();
	
	preloader = Titanium.UI.createActivityIndicator({
		top: 140,
		left: 100,
		height: 150,
		width: 100,
		font: { fontFamily: model.myFont, fontSize: 15, fontWeight: 'bold' },
		style: Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
	});
	preloader.color = css.getColor3();
	win.add(preloader);
	win.backgroundImage = '../dockedbg.png';	
};

//
// initial entry
//
init();
