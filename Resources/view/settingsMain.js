Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/tools.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

/**
 * local variables
 */
var win = Ti.UI.currentWindow;
var model = win.model;
var picasa = win.picasa;
var db = win.db;
var windowList = [];

function init() {
	var menuProvider = null;
	if (model.getCurrentUser() == null) {
		menuProvider = [
		{
			title: 'Provide Feedback',
			hasChild: true,
			leftImage: '../images/Gears.png',
			ptr: 'promptUser4Feedback.js'
		}]; 
	}
	else {
		menuProvider = [
		{
			title: 'Share with Facebook',
			hasChild: true,
			leftImage: '../images/Gears.png',
			ptr: 'fbSettings.js'
		},
		{
			title: 'Share with Twitter',
			hasChild: true,
			leftImage: '../images/Gears.png',
			ptr: 'twSettings.js'
		},
		{
			title: 'User Preferences',
			hasChild: true,
			leftImage: '../images/Gears.png',
			ptr: 'userPrefs.js'
		},
		{
			title: 'Provide Feedback',
			hasChild: true,
			leftImage: '../images/Gears.png',
			ptr: 'promptUser4Feedback.js'
		}];
	}
	
	var tblHeader = Ti.UI.createView({ height:30, width:320 });
	var label = Ti.UI.createLabel({ 
		top:5,
		left:10,
   		text:'Settings', 
		font: { fontFamily:model.myFont, fontSize:20, fontWeight:'bold' },
		color:CSSMgr.color2
	});
	tblHeader.add(label);
	
	var settingsMenu = Titanium.UI.createTableView({
		top:0,
		data: menuProvider,
		headerView:tblHeader,
		scrollable:false,
		moving:false,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		rowBackgroundColor:CSSMgr.color2
	});
	settingsMenu.addEventListener('click', function(e){
		if (e.rowData.ptr) {
			var w = Titanium.UI.createWindow({
				url:e.rowData.ptr,
				backgroundColor: CSSMgr.color2,
    			barColor:CSSMgr.color0,
				barImage: '../images/Header.png'
			});
			w.model = model;
			w.db = db;
			Titanium.UI.currentTab.open(w, {animated:true});
			windowList.push(w);
		}
	});
	win.add(settingsMenu);
	
	/*
	var exitBtn = Titanium.UI.createButton({
		backgroundImage:'../images/Chat.png',
		font: { fontFamily:model.myFont, fontSize:20, fontWeight:'bold' },
		style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		enabled: true,
		bottom: 20,
		right: 10,
		height: 30,
		width: 30
	});
	exitBtn.addEventListener('click', function(e) {
		Ti.App.fireEvent('EXIT_APP', {});
	});
	win.setRightNavButton(exitBtn);
	*/

	if (model.getCurrentUser() == null) {
		var lbl0 = Titanium.UI.createLabel({
			color: CSSMgr.color2,
			text: 'Register to become an active member of the Docked community: ',
			font: { fontFamily: model.myFont, fontSize: 15, fontWeight: 'bold' },
			bottom: 100,
			left: 10,
			width: 280,
			textAlign: 'left',
			height: 'auto'
		});
		win.add(lbl0);
		
		button0 = Titanium.UI.createButton({
			title: 'Sign Up',
			style: Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
			color:CSSMgr.color0,
			selectedColor:CSSMgr.color2,
			bottom: 60,
			left: 10,
			height: 30,
			width: 100
		});
		button0.addEventListener('click', function(e) {
			Ti.API.info('Start register process ....');
			Titanium.App.fireEvent('PROMPT_USER_TO_REGISTER_COMPLETE', { registerFlag:true });
		});
		win.add(button0);
	}
	settingsMenu.backgroundImage = '../images/Background.png';
	
	/*
	var aboutBtn = Titanium.UI.createButton({
		title: 'About Docked',
		enabled: true,
		color: CSSMgr.color0,
		systemButton: Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE,
		selectedColor:CSSMgr.color2,
		bottom: 60,
		borderRadius: 0,
		right: 20,
		height: 30,
		width: 150
	});
	*/
	var aboutBtn = Ti.UI.createImageView({
		image: '../images/DockedIcon.png',
		backgroundColor: CSSMgr.color0,
		borderColor: CSSMgr.color0,
		bottom: 55,
		right: 5,
		width: 50,
		height: 50,
		borderRadius:10,
		clickName: 'icon'
	});
	aboutBtn.addEventListener('click', function() {
		var w = Titanium.UI.createWindow({
			title: Msgs.APP_NAME,
			model:model,
			url:'showAbout.js'
		});
		w.open();
	});
	win.add(aboutBtn);
	
	/*
	 * iAd 
	 */
	Base.attachiAd(win);
	
};

//
// entry point
//
init();

