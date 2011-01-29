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
			title: 'Sign Up',
			hasChild: true,
			leftImage: '../phone_playmovie.png',
			ptr: 'registerUser.js'
		}, 
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
	
};

//
// entry point
//
init();

