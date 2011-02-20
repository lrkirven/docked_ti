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
			title: 'Share with Facebook',
			hasChild: true,
			leftImage: '../images/Gears.png',
			ptr: 'fbSettings.js'
		}, 
		{
			title: 'User Preferences',
			hasChild: true,
			leftImage: '../images/Gears.png',
			ptr: 'composeMsg.js'
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
			title: 'User Preferences',
			hasChild: true,
			leftImage: '../images/Gears.png',
			ptr: 'userPrefs.js'
		}];
	}
	
	var tblHeader = Ti.UI.createView({ height:30, width:320 });
	var label = Ti.UI.createLabel({ 
		top:5,
		left:10,
   		text:'Settings', 
		font: { fontFamily:model.myFont, fontSize:20, fontWeight:'bold' },
   		// color:'#ffffff'
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
				barImage: '../Header.png'
			});
			w.model = model;
			w.db = db;
			Titanium.UI.currentTab.open(w, {animated:true});
			windowList.push(w);
		}
	});
	win.add(settingsMenu);

	if (model.getCurrentUser() == null) {
		var lbl0 = Titanium.UI.createLabel({
			color: CSSMgr.color0,
			text: 'Register to become an active member of the Docked community: ',
			font: { fontFamily: model.myFont, fontSize: 15, fontWeight: 'bold' },
			top: 150,
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
			top: 195,
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
	 * iAd 
	 */
	Base.attachiAd(win);
	
};

//
// entry point
//
init();

