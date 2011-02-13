Ti.include('../util/msgs.js');
Ti.include('../util/geo.js');
Ti.include('../util/tools.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var picasa = win.picasa;
var searchText = null;
var searchView = null;
var msgView = null;
var searchPage = null;
var hsPage = null;
var selectedLake = null;


/**
 * This method builds a table to display messages at a remote locale.
 */
function buildHotSpotTableView(){
	var t = Titanium.UI.createTableView({
		// style:Titanium.UI.iPhone.TableViewStyle.PLAIN,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
		visible:false,
		separatorColor:CSSMgr.color5,
		top:0,
		left:0,
		width:325,
		height:350,
		backgroundColor:CSSMgr.color0
	});
	t.backgroundImage = '../dockedbg.png';
	//
	// listener
	//	
	t.addEventListener('click', function(e){
		if (e.rowData.renderer) {
			var rendererWin = Titanium.UI.createWindow({
				url: e.rowData.renderer,
				barImage: '../Header.png',
				backgroundColor: CSSMgr.color0,
				barColor: CSSMgr.color0,
				hotSpot: e.rowData.hotSpot,
				canEdit:false
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

/**
 * This method builds the view to display the messages currently active in a remote
 * community.
 * 
 * @param {Object} visible
 */
function buildHotSpotTable(visible) {
	//
	// empty msg view
	//
	hsPage = Ti.UI.createView({
		backgroundColor: CSSMgr.color0,
		visible:visible,
		top:45,
		left:0,
		height:'auto',
		width:'auto',
		clickName: 'hsPage'
	});
	
	msgView = buildHotSpotTableView();
	Ti.API.info('buildHotSpotTable: Adding msgView=' + msgView);
	hsPage.add(msgView);
	Ti.API.info('buildHotSpotTable: win=' + win);
	win.add(hsPage);	
};

function updateHotSpotTableViewDisplay(list) {
	Ti.API.info('updateHotSpotTableViewDisplay: # of items(s): ' + (list != null ? list.length : 0));
	if (list.length > 0) {
		Ti.API.info('updateHotSpotTableViewDisplay: msgView --> ' + msgView);
		var dataRowList = Base.buildHotSpotRows(list, 'hotSpotSelectedMain.js');
		Ti.API.info('updateHotSpotTableViewDisplay: rows -- ' + dataRowList.length);
		msgView.setData(dataRowList);
		msgView.visible = true;
		Ti.API.info('updateHotSpotTableViewDisplay: msgView --> ' + msgView);
	}
	else {
		msgView.setData([]);
		Tools.reportMsg(Msgs.APP_NAME, 'No HotSpots found');
	}
};


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
		Ti.API.info('updateSearchTableViewDisplay: results are empty');
		searchView.hide();
	}
};

//
// setup event listeners
//
Ti.App.addEventListener('HOTSPOT_DATA_RECD', function(e) {
	if (e.status == 0) {
		Ti.API.info('Handling event -- HOTSPOT_DATA_RECD --> ' + e.result);
		updateHotSpotTableViewDisplay(e.result);
		Ti.API.info('updateMsgTableViewDisplay: DONE');
		Ti.API.info('Adding view=' + msgView + ' page=' + hsPage);
		hsPage.visible = true;
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);
		win.close();
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

/**
 * Goes to server to get hotSpot data.
 */
function getHotSpots() {
	var lake = model.getCurrentLake();
	var client = new RestClient();
	client.getHotSpotsByLake(lake.id);	
};

/**
 * Initial entry ito this component
 */
function init() {
	Ti.API.info('localHotSpotViewer.init(): Entered ');
	
	/*
 	 * Modify the 'Back' button
 	 */
	Base.attachMyBACKButton(win);
	
	/*
	 * location header 
	 */
	headerView = Base.buildLocationHeader(win, true, '');

	/*
	 * build table to display to user
	 */
	buildHotSpotTable(false);
	
	/*
	 * get hotspot data from server
	 */
	getHotSpots();
};

/*
 * entry point
 */
init();
