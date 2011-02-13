Ti.include('../util/msgs.js');
Ti.include('../util/geo.js');
Ti.include('../util/tools.js');
Ti.include('../util/hotspot.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var picasa = win.picasa;
var searchText = null;
var searchView = null;
var hotSpotTable = null;
var searchPage = null;
var hsPage = null;
var selectedLake = null;

/**
 * This method builds a table to display messages at a remote locale.
 */
function buildHotSpotTableView(offset) {
	
	var t = Titanium.UI.createTableView({
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
		// style: Titanium.UI.iPhone.TableViewStyle.PLAIN,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		// rowBackgroundColor: CSSMgr.color0,
		backgroundColor: CSSMgr.color0,
		separatorColor:CSSMgr.color0,
		top:offset,
		// borderColor:CSSMgr.color0,
		color:CSSMgr.color0,
		fontSize:16,
		left:0,
		width:320
	});
	// t.backgroundImage = '../dockedbg.png';
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
				canEdit: true
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
function buildHotSpotPage(offset, visible) {
	//
	// empty msg view
	//
	hsPage = Ti.UI.createView({
		// backgroundColor: CSSMgr.color0,
		visible:visible,
		top:45,
		left:0,
		width:'auto',
		clickName: 'hsPage'
	});
	hsPage.backgroundImage = '../dockedbg.png';
	
	hotSpotTable = buildHotSpotTableView(0);
	Ti.API.info('buildHotSpotTable: Adding hotSpotTable=' + hotSpotTable);
	hsPage.add(hotSpotTable);
	Ti.API.info('buildHotSpotTable: win=' + win);
	win.add(hsPage);	
};

/**
 * This method updates the actual hotspot table with NEW data from the server.
 * 
 * @param {Object} list
 */
function updateHotSpotTable(list) {
	Ti.API.info('updateHotSpotTable: # of items(s): ' + (list != null ? list.length : 0));
	if (list.length > 0) {
		Ti.API.info('updateHotSpotTable: hotSpotTable --> ' + hotSpotTable);
		var dataRowList = Base.buildHotSpotRows(list, 'hotSpotSelectedMain.js');
		Ti.API.info('updateHotSpotTable: rows -- ' + dataRowList.length);
		hotSpotTable.setData(dataRowList);
		hotSpotTable.visible = true;
		Ti.API.info('updateHotSpotTable: hotSpotTable --> ' + hotSpotTable);
	}
	else {
		hotSpotTable.visible = false;
		Tools.reportMsg(Msgs.APP_NAME, 'No HotSpots found');
	}
};


/**
 * This method formats data objects to displayed in a table with 
 * headers.
 * 
 * @param {Object} list
 */
function formatDataForHeaders(list) {
	var i = 0;
	var modList = [];	
	var hotSpot = null;
	var currentCat = -1;
	
	for (i=0; i<list.length; i++) {
		hotSpot = list[i];
		if (hotSpot.category != currentCat) {
			while (1) {
				currentCat++;
				if (currentCat == hotSpot.category) {
					hotSpot.header = HotSpot.categoryLabels[currentCat];
					Ti.API.info('formatDataForHeaders: Added header = ' + hotSpot.header);
					break;
				}
				else if (currentCat > 5) {
					break;
				}
			}
		}
		modList.push(hotSpot);
	}
	return modList;
};

/**
 * This method handles incoming hotspot data from the server.
 * 
 * @param {Object} e
 */
Ti.App.addEventListener('HOTSPOT_DATA_RECD', function(e) {
	if (e.status == 0) {
		Ti.API.info('Handling event -- HOTSPOT_DATA_RECD --> ' + e.result);
		var modList = formatDataForHeaders(e.result);
		updateHotSpotTable(modList);
		Ti.API.info('Adding view=' + hotSpotTable + ' page=' + hsPage);
		hsPage.visible = true;
		hsPage.backgroundImage = '../dockedbg.png';
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);
	}
});

Titanium.App.addEventListener('RESET_MY_HOTSPOTS', function(e) { 
	Ti.API.info('Got RESET_MY_HOTSPOTS event ...');
	getHotSpots();
});

/**
 * Goes to server to get hotSpot data.
 */
function getHotSpots() {
	var user = model.getCurrentUser();
	var client = new RestClient();
	client.getHotSpotsByUserToken(user.userToken);
};

/**
 * Initial entry ito this component
 */
function init() {
	Ti.API.info('myHotSpotViewer.init(): Entered ');
	/*
 	 * Modify the 'Back' button
 	 */
	Base.attachMyBACKButton(win);
	
	/*
	 * location header 
	 */
	headerView = Base.buildPlainHeader(win, Msgs.MY_HOTSPOTS);
	
	/*
	 * build table to display to user
	 */
	buildHotSpotPage(55, true);
	
	/*
	 * get hotspot data from server
	 */
	getHotSpots();
};

/*
 * entry point
 */
init();
