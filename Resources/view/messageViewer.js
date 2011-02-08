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
var localFlag = win.localFlag;

var currentLake = null;
var tableView = null;
var headerView = null;
var composeMsgWin = null;
var composeMsgWinSubmitBtn = null;
var composeMsgWinPhotoIndBtn = null;
var postingInd = null;
var uploadInd = null;
var alertedUserOfNoMsgs = false;
var initPreloader = null;
var userCountLbl = null;
var newPostBtn = null;

var searchText = null;
var searchView = null;
var searchPage = null;
var selectedLake = null;
var remoteLake = null;

/**
 * Handle event if the user location has changed.
 * @param {Object} e
 */
Ti.App.addEventListener('LOCATION_CHANGED', function(e) {
	if (localFlag) {
		if (model.getCurrentLake() != null) {
			var countDisplay = model.getCurrentLake().localCount + Msgs.USERS;
			userCountLbl.text = countDisplay;
			if (newPostBtn != null) {
				newPostBtn.enabled = true;
			}
		}
		else {
			if (newPostBtn != null) {
				newPostBtn.enabled = false;
			}
		}
	}
});


function buildSearchView(visible) {
	searchPage = Ti.UI.createView({
		backgroundColor: CSSMgr.color0,
		left: 0,
		top: 0,
		visible:visible,
		height: 'auto',
		width: 'auto',
		clickName: 'searchPage'
	});
	var searchLbl = Ti.UI.createLabel({
		color: CSSMgr.color2,
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		left: 25,
		top: 5,
		height: 20,
		width: 'auto',
		text: 'Search and select lake to visit: '
	});
	searchPage.add(searchLbl);
	
	//
	// Test box for user to enter search criteria
	//
	searchText = Titanium.UI.createTextField({
		hintText: 'Enter full-text words to find a lake',
		height: 40,
		width: 280,
		left: 20,
		top: 30,
		font: { fontFamily: model.myFont, fontWeight: 'normal' },
		textAlign: 'left',
		keyboardType: Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		borderWidth: 2,
		borderRadius: 5
	});
	searchText.addEventListener('return', function(){
		Ti.API.info('Got return event ...');
		searchText.blur();
		var keyword = searchText.value;
		Ti.API.info('User entered the following: ' + keyword);
		var restClient = new RestClient();
		Ti.API.info('Starting lake search with keyword=' + keyword);
		restClient.searchLakesByKeyword(keyword);
	});
	searchPage.add(searchText);
	
	//
	// table to display search results
	//
	searchView = Titanium.UI.createTableView({
		separatorColor: CSSMgr.color0,
		style: Titanium.UI.iPhone.TableViewStyle.PLAIN,
		top: 75,
		height:300,
		visible:false,
		filterAttribute: 'filter',
		color: CSSMgr.color2,
		backgroundColor: CSSMgr.color0
	});
	searchView.addEventListener('click', function(e) { 
		Ti.API.info('User selected resource Id -- ' + e.rowData.lake.resourceId);
		searchPage.visible = false;
		win.remove(searchPage);
		remoteLake = e.rowData.lake;
		var restClient = new RestClient();
		restClient.getRemoteMsgEvents(e.rowData.lake.resourceId);
	});
	searchPage.add(searchView);
	win.add(searchPage);
};

/**
 * This method build table to search results.
 * 
 * @param {Object} lakeList
 */
function buildSearchResultsRowCollection(lakeList) {
	var i = 0;
	var item = null;
	var lake = null;
	var myDataRowList = [];
	var currentRow = null;
	var currentRowIndex = null;
	var username = null;
	var location = null;
	var msgTitle = null;
	
	Ti.API.info('buildSearchResultsRowCollection: Entered');
	
	if (lakeList != null) {
		Ti.API.info('buildSearchResultsRowCollection: size: ' + lakeList.length);
		for (i=0; i<lakeList.length; i++) {
			//
			// data fields
			//
			lake = lakeList[i];
		
			Ti.API.info('buildSearchResultsRowCollection: name=' + lake.name);	
			
			//
			// create table row
			//
			
			var row = Ti.UI.createTableViewRow({
				selectedBackgroundColor: '#fff',
				backgroundColor: CSSMgr.color0,
				height:0,
				width:'auto',
				lake:lake,
				borderColor: CSSMgr.color2,
				className: 'LakeRow' + i,
				clickName: 'row'
			});
			Ti.API.info('buildSearchResultsRowCollection: row=' + row);
		
			//
			// name of the lake
			//	
			var lakeNameLbl = Ti.UI.createLabel({
				color: CSSMgr.color2,
				font: {
					fontSize: '12',
					fontWeight: 'bold',
					fontFamily: model.myFont
				},
				left: 15,
				top: 0,
				height: 20,
				width: 'auto',
				clickName: 'lakeName',
				text: lake.name
			});
			row.add(lakeNameLbl);
		
			//
			// number of active users
			//	
			var userCountLbl = Ti.UI.createLabel({
				color: CSSMgr.color3,
				font: {
					fontSize: '10',
					fontWeight: 'bold',
					fontFamily: model.myFont
				},
				left: 25,
				top: 15,
				height: 20,
				width: 120,
				clickName: 'userCount',
				text: 'Active Users: ' + lake.numActiveUsers
			});
			row.add(userCountLbl);
		
			//
			// lasyUpdate timestamp
			//	
			var lastUpdateLbl = Ti.UI.createLabel({
				color: CSSMgr.color3,
				font: {
					fontSize: '10',
					fontWeight: 'bold',
					fontFamily: model.myFont
				},
				left: 130,
				top: 15,
				height: 20,
				width: 150,
				clickName: 'lastUpdate',
				text: 'Last Update: ' + lake.lastUpdateText
			});
			row.add(lastUpdateLbl);
			
			Ti.API.info('buildSearchResultsRowCollection: Adding row=' + row);
			myDataRowList.push(row);
		}
	}
	return myDataRowList;
};

function formatComments(str, len) {
	var s = '' + str;
	while (s.length < len) {
		s = s + '';
	}
   	Ti.API.info('formatComments: Returning [' + s + '] ' + s.length);
	return s;
}

/**
 * This method builds a message view without an attached photo to be added to an individual 
 * row inside of the table.
 * 
 * @param {Object} row
 * @param {Object} fontSize
 */
function appendMsgBody(row, fontSize) {
	var msgEvent = row.msgEvent;
	var msgBody = null;
	var userLocale = null;
	var userMsg = null;
	
	if (msgEvent.messageData != null && msgEvent.messageData.length > 35) {
		
		row.height = 90;
		
		msgBody = Ti.UI.createView({
			backgroundColor:CSSMgr.color0,
			left:60,
			top:0,
			height:90,
			width:230,
			clickName:'msgBody'
		});
		
		userMsg = Ti.UI.createLabel({
			color: '#fff',
			font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
			left: 5,
			top: 0,
			height: 50,
			width: 220,
			clickName: 'userMsg',
			text: msgEvent.messageData
		});
		
		msgBody.add(userMsg);
		
		userLocale = Ti.UI.createLabel({
			color:CSSMgr.color2,
			font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
			left:5,
			top:35,
			height:50,
			textAlign:'left',
			width:220,
			clickName:'userLocale',
			text:(msgEvent.username + ' on ' + msgEvent.location + ', ' + msgEvent.timeDisplay)
		});
		
		msgBody.add(userLocale);
	}
	else {
		row.height = 65;
		
		msgBody = Ti.UI.createView({
			backgroundColor:CSSMgr.color0,
			left:60,
			top:0,
			height:65,
			width:230,
			clickName:'msgBody'
		});
		
		userMsg = Ti.UI.createLabel({
			color: '#fff',
			font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
			left: 5,
			top: 0,
			height: 25,
			width: 220,
			clickName: 'userMsg',
			text: msgEvent.messageData
		});
		
		msgBody.add(userMsg);
		
		userLocale = Ti.UI.createLabel({
			color:CSSMgr.color2,
			font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
			left:5,
			top:15,
			height:50,
			textAlign:'left',
			width:220,
			clickName:'userLocale',
			text:(msgEvent.username + ' on ' + msgEvent.location + ', ' + msgEvent.timeDisplay)
		});
		
		msgBody.add(userLocale);
	}
	
	row.add(msgBody);	
	
}; 

/**
 * This method builds a message view with photo to be added to a row inside of a table.
 * 
 * @param {Object} row
 * @param {Object} fontSize
 */
function appendMsgBodyWithPhoto(row, fontSize) {
	var msgBody = null;
	var msgPhoto = null;
	var userLocale = null;
	var msgEvent = row.msgEvent;
	
	if (msgEvent.messageData != null && msgEvent.messageData.length > 20) {
		
		row.height = 90;
		
		msgBody = Ti.UI.createView({
			backgroundColor: CSSMgr.color0,
			left: 60,
			top: 0,
			height: 90,
			width: 230,
			clickName: 'msgBody'
		});
		msgPhoto = Ti.UI.createImageView({
			image: msgEvent.photoUrl,
			backgroundColor: CSSMgr.color0,
			borderColor: CSSMgr.color1,
			top: 12,
			left: 0,
			width: 50,
			height: 50,
			clickName: 'msgPhoto'
		});
		msgBody.add(msgPhoto);
		
		userMsg = Ti.UI.createLabel({
			color: '#fff',
			font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
			left: 60,
			top: 0,
			height: 50,
			width: 160,
			clickName: 'comment',
			text: msgEvent.messageData
		});
		msgBody.add(userMsg);
		
		var desc1 = msgEvent.username + ' on ' + msgEvent.location + ', ' + msgEvent.timeDisplay;
		if (desc1.length > 45) {
			desc1 = desc1.substr(0, 40);
			desc1 += "...";
		}
		userLocale = Ti.UI.createLabel({
			color: CSSMgr.color2,
			font: { fontSize: 11, fontWeight: 'normal', fontFamily: model.myFont },
			left: 60,
			top: 35,
			height: 50,
			textAlign: 'left',
			width: 160,
			clickName: 'userLocale',
			text:desc1
		});
		msgBody.add(userLocale);
	}
	else {
		
		row.height = 75;
		
		msgBody = Ti.UI.createView({
			backgroundColor: CSSMgr.color0,
			left: 60,
			top: 0,
			height: 65,
			width: 230,
			clickName: 'msgBody'
		});
		msgPhoto = Ti.UI.createImageView({
			image: msgEvent.photoUrl,
			backgroundColor: CSSMgr.color0,
			borderColor: CSSMgr.color1,
			top: 12,
			left: 0,
			width: 50,
			height: 50,
			clickName: 'msgPhoto'
		});
		msgBody.add(msgPhoto);
		
		userMsg = Ti.UI.createLabel({
			color: '#fff',
			font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
			left: 60,
			top: 0,
			height: 25,
			width: 160,
			clickName: 'userMsg',
			text: msgEvent.messageData
		});
		msgBody.add(userMsg);
		
		var desc2 = msgEvent.username + ' on ' + msgEvent.location + ', ' + msgEvent.timeDisplay;
		if (desc2.length > 45) {
			desc2 = desc2.substr(0, 40);
			desc2 += "...";
		}
		userLocale = Ti.UI.createLabel({
			color: CSSMgr.color2,
			font: { fontSize: 11, fontWeight: 'normal', fontFamily: model.myFont },
			left: 60,
			top: 15,
			height: 50,
			textAlign: 'left',
			width: 160,
			clickName: 'userLocale',
			text: desc2
		});
		msgBody.add(userLocale);
	}
	row.add(msgBody);	
}; 

/**
 * This method adds the author's profile photo if they have one to their message view (or entry).
 * 
 * @param {Object} row
 */
function appendProfilePhoto(row) {
	var msgEvent = row.msgEvent;
	if (msgEvent.profileUrl == undefined) {
		var defaultIDImage = null;
		defaultIDImage = Ti.UI.createImageView({
			image: '../user.png',
			backgroundColor:CSSMgr.color0,
			borderColor:CSSMgr.color1,
			top:0,
			left:0,
			width:50,
			height:50,
			clickName:'defaultIDImage'
		});
		row.add(defaultIDImage);
	}
	else {
		var userProfilePhoto = Ti.UI.createImageView({
			image: msgEvent.profileUrl,
			backgroundColor: CSSMgr.color0,
			borderColor: CSSMgr.color1,
			top:0,
			left:0,
			width:50,
			height:50,
			clickName:'photo'
		});
		row.add(userProfilePhoto);
	}
};

/**
 * This method builds and adds all of the listeners to handle all of the user interaction
 * at the top the window.
 */

/**
 * This method updates the data display with search results from the server.
 * 
 * @param {Object} list
 */
function updateSearchTableViewDisplay(searchResults) {
	Ti.API.info('updateSearchTableViewDisplay: # of lake matches ' + (searchResults != null ? searchResults.length : 0));
	if (searchResults.length > 0) {
		var dataRowList = buildSearchResultsRowCollection(searchResults);
		Ti.API.info('updateSearchTableViewDisplay: # of results: ' + (dataRowList == null ? 0 : dataRowList.length));
		Ti.API.info('updateSearchTableViewDisplay: searchView=' + searchView);
		searchView.setData(dataRowList);
		searchView.show();
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, 'No matching results for search criteria.');
		Ti.API.info('updateSearchTableViewDisplay: results are empty');
		searchView.hide();
	}
};

/**
 * This method is to update the data within the tableView (or datagrid) displaying the
 * scrolling message events to the user.
 * 
 * @param {Object} list
 */
function updateTableViewDisplay(list) {
	Ti.API.info('updateTableViewDisplay: # of msg(s): ' + (list != null ? list.length : 0));
	if (list.length > 0) {
		tableView.hide();
		initPreloader.show();
		var dataRowList = Base.buildRowCollection(list);
		tableView.setData(dataRowList);
		initPreloader.hide();
		tableView.show();
	}
	else {
		if (!alertedUserOfNoMsgs) {
			alertedUserOfNoMsgs = true;
			Tools.reportMsg(Msgs.APP_NAME, Msgs.NO_BUZZ);
		}
		if (tableView != null) {
			tableView.hide();
		}
		initPreloader.hide();
	}
};

/**
 * This method builds the message event table and adds the listeners for
 * managing the user clicking a message.
 */
function buildTableView(){
	var t = Titanium.UI.createTableView({
		separatorColor: CSSMgr.color2,
		style: Titanium.UI.iPhone.TableViewStyle.PLAIN,
		top: 55,
		filterAttribute: 'filter',
		backgroundColor: CSSMgr.color0
	});
	t.addEventListener('click', function(e){
		if (e.rowData.renderer) {
			var rendererWin = Titanium.UI.createWindow({
				url: e.rowData.renderer,
				title: e.rowData.title,
				localFlag:localFlag,
				backgroundColor: CSSMgr.color0,
				barColor: CSSMgr.color0
			});
			rendererWin.model = model;
			Ti.API.info('---------------> ' + e.rowData);
			Ti.API.info('---------------> ' + e.rowData.msgEvent);
			rendererWin.msgEvent = e.rowData.msgEvent;
			Titanium.UI.currentTab.open(rendererWin, {
				animated: true
			});
		}
	});
	return t;
};

function check4LocalMsgEvents() {
	var client = new RestClient();
	var activeLake = model.getCurrentLake();
	if (activeLake != null) {
		Ti.API.info('check4MsgEvent(): resourceId ---> ' + activeLake.id);
		client.getLocalMsgEvents(activeLake.id);
	}
	else {
		Ti.API.info('check4MsgEvent(): Not in a region to view messages!!!!');
		updateTableViewDisplay([]);
	}
};

function check4RemoteMsgEvents() {
	var client = new RestClient();
	if (remoteLake != null) {
		Ti.API.info('check4RemoteMsgEvents(): resourceId ---> ' + remoteLake.id);
		client.getLocalMsgEvents(remoteLake.id);
	}
	else {
		Ti.API.info('check4RemoteMsgEvents(): Not in a region to view messages!!!!');
		updateTableViewDisplay([]);
	}
};

//////////////////////////////////////////
//
// Event Listeners
//
//////////////////////////////////////////

Titanium.App.addEventListener('FOUND_LAST_BUCKET', function(e) {
	Ti.API.info('Got event FOUND_LAST_BUCKET ...');
	model.setLastBucket(e.lastBucket);
	if (composeMsgWinSubmitBtn != null) {
		Ti.API.info('Enabling submitBtn ...');
		composeMsgWinSubmitBtn.enabled = true;
	}
	else {
		Ti.API.info('Disabling submitBtn ...');
		composeMsgWinSubmitBtn.enabled = false;
	}
});

Ti.App.addEventListener('SEARCH_RESULTS_RECD', function(e) {
	if (e.status == 0) {
		Ti.API.info('Handling event -- SEARCH_RESULTS_RECD --> ' + e.result);
		updateSearchTableViewDisplay(e.result);
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);
	}
});

Titanium.App.addEventListener('LOCAL_MSG_EVENTS_RECD', function(e) {
	if (e.status == 0) {
		Ti.API.info('Handling event -- LOCAL_MSG_EVENTS_RECD --> ' + e.result);
		//
		// update to data
		//
		if (headerView == null) {
			headerView = Base.buildLocationHeader(win, true, '');
		}
		if (tableView != null) {
			win.remove(tableView);
		}
		tableView = buildTableView();
		win.add(tableView);
		updateTableViewDisplay(e.result);
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);			
	}
});

Titanium.App.addEventListener('REMOTE_MSG_EVENTS_RECD', function(e) {
	if (e.status == 0) {
		Ti.API.info('Handling event -- REMOTE_MSG_EVENTS_RECD --> ' + e.result);
		//
		// update to data
		//
		if (headerView == null) {
			headerView = Base.buildLocationHeader(win, false, remoteLake.name);
		}
		if (tableView != null) {
			win.remove(tableView);
		}
		tableView = buildTableView();
		win.add(tableView);
		updateTableViewDisplay(e.result);
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);			
	}
});


/**
 * This is the initial entry to the functionality of this window
 */
function init() {
	Base.attachMyBACKButton(win);
	//
	// initial app preloader
	//	
	initPreloader = Base.showPreloader(win, null);

	if (localFlag) {
		//	
		// start refresh timer
		//
		setInterval(check4LocalMsgEvents, 120000);
		//
		// get messages	
		//
		check4LocalMsgEvents();
	}
	else {
		//	
		// start refresh timer
		//
		setInterval(check4RemoteMsgEvents, 120000);
		//
		// display search form
		//
		buildSearchView(true);
	}

};

//
// entry point
//
init();

