Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/geo.js');
Ti.include('../util/tools.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');
Ti.include('baseViewer.js');

/*
 * Incoming argument to the window object
 */
var win = Ti.UI.currentWindow;
var model = win.model;
var picasa = win.picasa;
var localFlag = win.localFlag;
var remoteOption = win.remoteOption;

/*
 * members of this window instance
 */
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

function round(num) {
	var dec = 2;
	var val = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return val;
}

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

/**
 * This method build a search window for the user to search for lake to visit.
 * 
 * @param {Object} visible
 */
function buildSearchView(visible, basic) {
	
	if (basic) {
		searchPage = Ti.UI.createView({
			backgroundColor: CSSMgr.color0,
			left: 0,
			top: 0,
			width: 320,
			visible: visible,
			backgroundColor:'transparent',
			height: 'auto',
			width: 'auto',
			clickName: 'searchPage'
		});
	
		/*	
		var searchLbl = Ti.UI.createLabel({
			color: CSSMgr.color0,
			font: { fontFamily: model.myFont, fontWeight: 'bold' },
			left: 25,
			top: 5,
			height: 20,
			width: 'auto',
			text: 'Search and select lake to visit: '
		});
		searchPage.add(searchLbl);
		*/
		
		//
		// Test box for user to enter search criteria
		//
		searchText = Titanium.UI.createTextField({
			hintText: 'Enter full-text words to find a lake',
			height: 40,
			width: 280,
			left: 20,
			top: 5,
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
			top: 55,
			width: 320,
			height: 450,
			visible: false,
			filterAttribute: 'filter',
			color: CSSMgr.color2,
			backgroundColor: CSSMgr.color0
		});
		searchView.addEventListener('click', function(e){
			Ti.API.info('User selected resKey --> ' + e.rowData.lake.resKey);
			searchPage.visible = false;
			win.remove(searchPage);
			remoteLake = e.rowData.lake;
			var restClient = new RestClient();
			restClient.getRemoteMsgEvents(e.rowData.lake.resKey);
		});
		searchPage.backgroundImage = '../images/Background.png';
		searchPage.add(searchView);
		win.add(searchPage);
	}
	else {
		searchPage = Ti.UI.createView({
			left: 0,
			top: 0,
			visible: true,
			width: 320,
			clickName: 'searchPage'
		});
		
		//
		// table to display search results
		//
		searchView = Titanium.UI.createTableView({
			separatorColor: CSSMgr.color0,
			style: Titanium.UI.iPhone.TableViewStyle.PLAIN,
			top: 0,
			width: 320,
			backgroundColor:'transparent',
			visible: true,
			selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
			rowBackgroundColor:CSSMgr.color2
		});
		searchView.addEventListener('click', function(e){
			Ti.API.info('User selected resKey --> ' + e.rowData.lake.resKey);
			searchPage.visible = false;
			win.remove(searchPage);
			remoteLake = e.rowData.lake;
			var restClient = new RestClient();
			restClient.getRemoteMsgEvents(e.rowData.lake.resKey);
		});
		searchPage.backgroundImage = '../images/Background.png';
		searchPage.add(searchView);
		win.add(searchPage);	
	}
};

/**
 * This method build table to search results.
 * 
 * @param {Object} lakeList
 */
function buildSearchResultsRowCollection(lakeList, showDistFlag) {
	var i = 0;
	var item = null;
	var lake = null;
	var myDataRowList = [];
	var currentRow = null;
	var currentRowIndex = null;
	var username = null;
	var location = null;
	var msgTitle = null;
	
	
	var currentLake = model.getCurrentLake();
	if (currentLake != null) {
		Ti.API.info('buildSearchResultsRowCollection: SKIP :: currentLake=' + currentLake.resKey);
	}
	
	if (lakeList != null) {
		Ti.API.info('buildSearchResultsRowCollection: size: ' + lakeList.length);
		for (i=0; i<lakeList.length; i++) {
			//
			// data fields
			//
			lake = lakeList[i];
		
			if (currentLake != null && lake.resKey == currentLake.resKey) {
				continue;
			}
		
			Ti.API.info('buildSearchResultsRowCollection: name=' + lake.name + 
				' resourceId=' + lake.resKey);	
			
			//
			// create table row
			//
			
			var row = Ti.UI.createTableViewRow({
				color: CSSMgr.color0,
				backgroundColor:CSSMgr.color2,
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
				color: CSSMgr.color0,
				font: { fontSize: '12', fontWeight: 'bold', fontFamily: model.myFont },
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
				color: CSSMgr.color0,
				font: { fontSize: '10', fontWeight: 'bold', fontFamily: model.myFont },
				left: 15,
				top: 15,
				height: 20,
				width: 120,
				clickName: 'userCount',
				text: 'Active Users: ' + lake.activeUsers
			});
			row.add(userCountLbl);
		
			
			
			if (showDistFlag) {
				var distLbl = Ti.UI.createLabel({
					color: CSSMgr.color0,
					font: { fontSize: '10', fontWeight: 'bold', fontFamily: model.myFont },
					left: 100,
					top: 15,
					height: 20,
					width: 150,
					clickName: 'distAway',
					text: 'Miles away: ' + round(lake.distanceAway)
				});
				row.add(distLbl);
			}
			else {
				//
				// lastUpdate timestamp
				//	
				var lastUpdateLbl = Ti.UI.createLabel({
					color: CSSMgr.color0,
					font: { fontSize: '10', fontWeight: 'bold', fontFamily: model.myFont },
					left: 100,
					top: 15,
					height: 20,
					width: 150,
					clickName: 'lastUpdate',
					text: 'Last Update: ' + lake.lastUpdateText
				});
				row.add(lastUpdateLbl);
			}
			
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
 * This method builds and adds all of the listeners to handle all of the user interaction
 * at the top the window.
 */

/**
 * This method updates the data display with search results from the server.
 * 
 * @param {Object} list
 */
function updateSearchTableViewDisplay(searchResults, showDistFlag) {
	Ti.API.info('updateSearchTableViewDisplay: # of lake matches ' + (searchResults != null ? searchResults.length : 0));
	if (searchResults.length > 0) {
		var dataRowList = buildSearchResultsRowCollection(searchResults, showDistFlag);
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
		var dataRowList = Base.buildBuzzRows(list, 'messageRenderer.js');
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
function buildTableView() {
	var t = Titanium.UI.createTableView({
		style: Titanium.UI.iPhone.TableViewStyle.PLAIN,
		top: 55,
		separatorColor:CSSMgr.color2,
		filterAttribute: 'filter',
		backgroundColor: CSSMgr.color0
	});
	t.addEventListener('click', function(e){
		if (e.rowData.renderer) {
			var rendererWin = Titanium.UI.createWindow({
				url: e.rowData.renderer,
				barImage: '../images/Header.png',
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
	t.backgroundImage = '../images/Background.png';
	return t;
};

function check4LocalMsgEvents() {
	var client = new RestClient();
	var activeLake = model.getCurrentLake();
	if (activeLake != null) {
		Ti.API.info('check4MsgEvent(): resKey ---> ' + activeLake.resKey);
		client.getLocalMsgEvents(activeLake.resKey);
	}
	else {
		Ti.API.info('check4MsgEvent(): Not in a region to view messages!!!!');
		updateTableViewDisplay([]);
	}
};

function check4RemoteMsgEvents() {
	var client = new RestClient();
	if (remoteLake != null) {
		Ti.API.info('check4RemoteMsgEvents(): resKey ---> ' + remoteLake.resKey);
		client.getLocalMsgEvents(remoteLake.resKey);
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

Titanium.App.addEventListener('SEARCH_RESULTS_RECD', function(e) {
	if (e.status == 0) {
		Ti.API.info('Handling event -- SEARCH_RESULTS_RECD --> ' + e.result);
		updateSearchTableViewDisplay(e.result, true);
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);
	}
});

Titanium.App.addEventListener('CLOSEST_RES_RECD', function(e) {
	if (e.status == 0) {
		Ti.API.info('Handling event -- SEARCH_RESULTS_RECD --> ' + e.result);
		updateSearchTableViewDisplay(e.result, true);
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);
	}
});


/**
 * This method handles event when we are receiving buzz messages from the server.
 * 
 * @param {Object} e
 */
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

/**
 * This mthod handles receiving buzz msg from the server when we are visiting
 * a remote location and not actual at the that lake.
 * 
 * @param {Object} e
 */
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
	initPreloader = Base.showPreloader(win, null, false);

	if (localFlag) {
		Ti.API.info('buzzViewer.init(): Local Mode');
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
		if (remoteOption == 0) {
			Ti.API.info('buzzViewer.init(): Remote -- Search Mode');
			//
			// display search form
			//
			buildSearchView(true, true);
		}
		else if (remoteOption == 1) {
			Ti.API.info('buzzViewer.init(): Remote -- Closest Mode');
			//
			// display preset results
			//
			buildSearchView(true, false);
			var c = new RestClient();
			c.getClosestResources(model.getActualLat(), model.getActualLng());
		}
	}

};

//
// entry point
//
init();

