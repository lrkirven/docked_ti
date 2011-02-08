Ti.include('../util/msgs.js');
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

function appendProfilePhoto(row) {
	Ti.API.info('appendProfilePhoto: row=' + row);
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
		Ti.API.info('appendProfilePhoto: Added default id image=' + defaultIDImage);
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
		Ti.API.info('appendProfilePhoto: Added custom id image=' + userProfilePhoto);
	}
};

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
	
	Ti.API.info('appendMsgBody: row=' + row);
		
	if (msgEvent.messageData != null && msgEvent.messageData.length > 30) {
		
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
	
	Ti.API.info('appendMsgBodyWithPhoto: row=' + row);
	
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
		
		userLocale = Ti.UI.createLabel({
			color: CSSMgr.color2,
			font: { fontSize: 11, fontWeight: 'normal', fontFamily: model.myFont },
			left: 60,
			top: 35,
			height: 50,
			textAlign: 'left',
			width: 160,
			clickName: 'userLocale',
			text:(msgEvent.username + ' on ' + msgEvent.location + ', ' + msgEvent.timeDisplay)
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
		
		userLocale = Ti.UI.createLabel({
			color: CSSMgr.color2,
			font: { fontSize: 11, fontWeight: 'normal', fontFamily: model.myFont },
			left: 60,
			top: 15,
			height: 50,
			textAlign: 'left',
			width: 160,
			clickName: 'userLocale',
			text:(msgEvent.username + ' on ' + msgEvent.location + ', ' + msgEvent.timeDisplay)
		});
		msgBody.add(userLocale);
	}
	row.add(msgBody);	
}; 

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
		hsPage.visible = true;
		selectedLake.text = e.rowData.lake.name;
		var restClient = new RestClient();
		restClient.getRemoteMsgEvents(e.rowData.lake.resourceId);
	});
	searchPage.add(searchView);
	win.add(searchPage);
};


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
			
			// item = { title: lake.name };
		
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
			
			// myDataRowList.push(item);
		}
	}
	return myDataRowList;
};

/**
 * This method builds a table to display messages at a remote locale.
 */
function buildHotSpotTableView() {
	var t = Titanium.UI.createTableView({
		separatorColor:CSSMgr.color2,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
		top:0,
		left:0,
		width:325,
		height:350,
		backgroundColor:CSSMgr.color0
	});
	//
	// listener
	//	
	t.addEventListener('click', function(e){
		if (e.rowData.renderer) {
			var rendererWin = Titanium.UI.createWindow({
				url: e.rowData.renderer,
				title: e.rowData.title,
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
		backgroundColor: CSSMgr.color0,
		visible:visible,
		top:offset,
		left:0,
		height:'auto',
		width:'auto',
		clickName: 'hsPage'
	});
	
	hotSpotTable = buildHotSpotTableView();
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
		var dataRowList = Base.buildRowCollection(list);
		Ti.API.info('updateHotSpotTable: rows -- ' + dataRowList.length);
		hotSpotTable.setData(dataRowList);
		hotSpotTable.visible = true;
		Ti.API.info('updateHotSpotTable: hotSpotTable --> ' + hotSpotTable);
	}
	else {
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
			currentCat++;
			hotSpot.header = HotSpot.categoryLabels[currentCat];
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
		Ti.API.info('updateMsgTableViewDisplay: DONE');
		Ti.API.info('Adding view=' + hotSpotTable + ' page=' + hsPage);
		hsPage.visible = true;
	}
	else {
		Tools.reportMsg(Msgs.APP_NAME, e.errorMsg);
	}
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
	
	/*
	 * headerView = Base.buildLocationHeader(win, true, '');
	 */

	/*
	 * build table to display to user
	 */
	buildHotSpotPage(0, true);
	
	/*
	 * get hotspot data from server
	 */
	getHotSpots();
};

/*
 * entry point
 */
init();
