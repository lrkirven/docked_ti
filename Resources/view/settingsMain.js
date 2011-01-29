Ti.include('../util/tools.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');
Ti.include('../props/cssMgr.js');

/**
 * local variables
 */
var win = Ti.UI.currentWindow;
var model = win.model;
var picasa = win.picasa;
var css = win.css;
var windowList = [];

function init() {
	var menuProvider = null;
	if (model.getCurrentUser() == null) {
		menuProvider = [
		{
			title: 'Share with Facebook',
			hasChild: true,
			leftImage: '../phone_playmovie.png',
			ptr: 'fbSettings.js'
		}, 
		{
			title: 'User Preferences',
			hasChild: true,
			leftImage: '../phone_playmovie.png',
			ptr: 'composeMsg.js'
		}];
	}
	else {
		menuProvider = [
		{
			title: 'Share with Facebook',
			hasChild: true,
			leftImage: '../phone_playmovie.png',
			ptr: 'fbSettings.js'
		}, 
		{
			title: 'User Preferences',
			hasChild: true,
			leftImage: '../phone_playmovie.png',
			ptr: 'composeMsg.js'
		}];
	}
	
	var settingsMenu = Titanium.UI.createTableView({
		top:5,
		data: menuProvider,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
		backgroundColor:css.getColor2(),
		rowBackgroundColor:css.getColor2()
	});
	settingsMenu.addEventListener('click', function(e){
		if (e.rowData.ptr) {
			var w = Titanium.UI.createWindow({
				url:e.rowData.ptr,
				backgroundColor:'#CCCCCC',
    			barColor:css.getColor0(),
				title:e.rowData.title
			});
			w.model = model;
			w.css = css;
			Titanium.UI.currentTab.open(w, {animated:true});
			windowList.push(w);
		}
	});
	win.add(settingsMenu);

	if (model.getCurrentUser() == null) {
		var lbl0 = Titanium.UI.createLabel({
			color: css.getColor0(),
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
			color:css.getColor0(),
			selectedColor:css.getColor2(),
			top: 195,
			left: 10,
			height: 30,
			width: 100,
		});
		button0.addEventListener('click', function(e) {
			Ti.API.info('Start register process ....');
			Titanium.App.fireEvent('PROMPT_USER_TO_REGISTER_COMPLETE', { registerFlag:true });
			/*
			var registerWin = Titanium.UI.createWindow({
				title: model.getAppName(),
				color: css.getColor2(),
				font: { fontSize: 20, fontFamily: myFont },
				backgroundColor: css.getColor0(),
				barColor: css.getColor0(),
				url: 'basicRegisterUser.js'
			});
			registerWin.model = model;
			registerWin.db = db;
			registerWin.css = css;
			registerWin.open();
			*/
		});
		win.add(button0);
	}
	
};

//
// entry point
//
init();

