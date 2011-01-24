Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;
var picasa = win.picasa;
var searchText = null;
var searchView = null;
var msgView = null;
var searchPage = null;
var msgPage = null;
var selectedLake = null;

function appendProfilePhoto(row) {
	Ti.API.info('appendProfilePhoto: row=' + row);
	var msgEvent = row.msgEvent;
	if (msgEvent.profileUrl == undefined) {
		var defaultIDImage = null;
		defaultIDImage = Ti.UI.createImageView({
			image: '../user.png',
			backgroundColor:css.getColor0(),
			borderColor:css.getColor1(),
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
			backgroundColor: css.getColor0(),
			borderColor: css.getColor1(),
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
			backgroundColor:css.getColor0(),
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
			color:css.getColor2(),
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
			backgroundColor:css.getColor0(),
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
			color:css.getColor2(),
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
			backgroundColor: css.getColor0(),
			left: 60,
			top: 0,
			height: 90,
			width: 230,
			clickName: 'msgBody'
		});
		msgPhoto = Ti.UI.createImageView({
			image: msgEvent.photoUrl,
			backgroundColor: css.getColor0(),
			borderColor: css.getColor1(),
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
			color: css.getColor2(),
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
			backgroundColor: css.getColor0(),
			left: 60,
			top: 0,
			height: 65,
			width: 230,
			clickName: 'msgBody'
		});
		msgPhoto = Ti.UI.createImageView({
			image: msgEvent.photoUrl,
			backgroundColor: css.getColor0(),
			borderColor: css.getColor1(),
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
			color: css.getColor2(),
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
		backgroundColor: css.getColor0(),
		left: 0,
		top: 0,
		visible:visible,
		height: 'auto',
		width: 'auto',
		clickName: 'searchPage'
	});
	var searchLbl = Ti.UI.createLabel({
		color: css.getColor2(),
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
		separatorColor: css.getColor0(),
		style: Titanium.UI.iPhone.TableViewStyle.PLAIN,
		top: 75,
		height:300,
		visible:false,
		filterAttribute: 'filter',
		color: css.getColor2(),
		backgroundColor: css.getColor0()
	});
	searchView.addEventListener('click', function(e) { 
		Ti.API.info('User selected resource Id -- ' + e.rowData.lake.resourceId);
		searchPage.visible = false;
		msgPage.visible = true;
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
				backgroundColor: css.getColor0(),
				height:0,
				width:'auto',
				lake:lake,
				borderColor: css.getColor2(),
				className: 'LakeRow' + i,
				clickName: 'row'
			});
			Ti.API.info('buildSearchResultsRowCollection: row=' + row);
		
			//
			// name of the lake
			//	
			var lakeNameLbl = Ti.UI.createLabel({
				color: css.getColor2(),
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
				color: css.getColor3(),
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
				color: css.getColor3(),
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

function buildMsgRowCollection(msgEventList) {
	var i = 0;
	var msgEvent = null;
	var myDataRowList = [];
	// create a var to track the active row
	var currentRow = null;
	var currentRowIndex = null;
	var username = null;
	var location = null;
	var msgTitle = null;
	
	if (msgEventList != null) {
		Ti.API.info('buildMsgRowCollection: size: ' + msgEventList.length);
		for (i=0; i<msgEventList.length; i++) {
			//
			// data fields
			//
			msgEvent = msgEventList[i];
		
			//
			// if alot of people deem this message as obscene, just stop showing it
			//		
			if (msgEvent.badCounter > 3) {
				continue;
			}
			
			
			Ti.info('buil: msgEvent= ' + msgEvent);
			username = msgEvent.username;
			Ti.API.info('buildMsgRowCollection: username: ' + username);
			location = msgEvent.location;
			Ti.API.info('buildMsgRowCollection: location: ' + location);
			msgTitle = 'Posted by ' + username + ' on ' + location;
			Ti.API.info('buildMsgRowCollection: title: ' + msgTitle);
			
		/
			// create table row
			//
			var row = Ti.UI.createTableViewRow({
				selectedBackgroundColor: '#fff',
				backgroundColor: css.getColor0(),
				left:0,
				height:0,
				width:'auto',
				borderColor: css.getColor2(),
				className: 'MsgEventRow' + i,
				clickName: 'row',
				msgEvent:msgEvent,
				renderer: 'messageRendererReadOnly.js',
				hasChild: true
			});
			Ti.API.info('buildMsgRowCollection: row=' + row);
			
			//
			// build message body
			//	
			Ti.API.info('buildMsgRowCollection: Adding profile pic');
			appendProfilePhoto(row);
			Ti.API.info('buildMsgRowCollection: Done');
			
			var fontSize = 14;
			if (Titanium.Platform.name == 'android') {
				fontSize = 13;
			}
			Ti.API.info('buildMsgRowCollection: Starting msg body');
			
			if (msgEvent.photoUrl == undefined) {
				Ti.API.info('buildMsgRowCollection: BASIC msg body ... fontSize=' + fontSize);
				appendMsgBody(row, fontSize);
			}
			else {
				Ti.API.info('buildMsgRowCollection: PHOTO msg body ... fontSize=' + fontSize);
				appendMsgBodyWithPhoto(row, fontSize);
			}
			
			var replyCounter = Ti.UI.createLabel({
				color: css.getColor3(),
				font: {
					fontSize: '10',
					fontWeight: 'bold',
					fontFamily: model.myFont
				},
				right: 0,
				top: 0,
				height: 20,
				width: 20,
				clickName: 'replyCounter',
				text: ''
			});
			if (msgEvent.commentCounter > 0) {
				replyCounter.text = '+' + msgEvent.commentCounter;
			} 
			row.add(replyCounter);
			// add row
			myDataRowList.push(row);
		}
	}
	return myDataRowList;
};

/**
 * This method builds a table to display messages at a remote locale.
 */
function buildMsgTableView(){
	var t = Titanium.UI.createTableView({
		separatorColor:css.getColor2(),
		style:Titanium.UI.iPhone.TableViewStyle.PLAIN,
		visible:false,
		top:50,
		left:0,
		width:325,
		height:350,
		backgroundColor:css.getColor0()
	});
	//
	// listener
	//	
	t.addEventListener('click', function(e){
		if (e.rowData.renderer) {
			var rendererWin = Titanium.UI.createWindow({
				url: e.rowData.renderer,
				title: e.rowData.title,
				backgroundColor: css.getColor0(),
				barColor: css.getColor0()
			});
			rendererWin.model = model;
			rendererWin.css = css;
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
function buildMsgView(visible) {
	//
	// empty msg view
	//
	msgPage = Ti.UI.createView({
		backgroundColor: css.getColor0(),
		visible:visible,
		top:0,
		left:0,
		height:'auto',
		width:'auto',
		clickName: 'msgPage'
	});
	
	var h = Ti.UI.createView({
		height: 50,
		top: 0,
		borderColor: css.getColor2(),
		backgroundColor: css.getColor0()
	});
	var headerLbl0 = 'Remote Location: ';
	var label0 = Ti.UI.createLabel({
		text: headerLbl0,
		top: 0,
		left: 10,
		height: 20,
		font: {
			fontFamily: model.myFont,
			fontSize: 11,
			fontWeight: 'normal'
		},
		color: '#fff'
	});
	h.add(label0);
	selectedLake = Ti.UI.createLabel({
		color: css.getColor2(),
		font: { fontFamily: model.myFont, fontSize: 16, fontWeight: 'bold' },
		left: 10,
		top: 10,
		height: 40,
		width: 300,
		clickName: 'userMsg',
		text:'' 
	});
	h.add(selectedLake);
	
	msgPage.add(h);
	msgView = buildMsgTableView();
	Ti.API.info('buildMsgView: Adding msgView=' + msgView);
	msgPage.add(msgView);
	Ti.API.info('buildMsgView: win=' + win);
	win.add(msgPage);	
};

function updateMsgTableViewDisplay(list) {
	Ti.API.info('updateMsgTableViewDisplay: # of msg(s): ' + (list != null ? list.length : 0));
	if (list.length > 0) {
		Ti.API.info('updateMsgTableViewDisplay: msgView --> ' + msgView);
		var dataRowList = buildMsgRowCollection(list);
		Ti.API.info('updateMsgTableViewDisplay: rows -- ' + dataRowList.length);
		msgView.setData(dataRowList);
		msgView.visible = true;
		Ti.API.info('updateMsgTableViewDisplay: msgView --> ' + msgView);
	}
	else {
		alert('No messages found.');
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
		alert('No matching results for request.');
		Ti.API.info('updateSearchTableViewDisplay: results are empty');
		searchView.hide();
		
	}
};

/**
 * Initial entry ito this component
 */
function init() {
	Ti.API.info('searchLakes.init(): Entered ');
	
	//
	// setup event listeners
	//
	Ti.App.addEventListener('REMOTE_MSG_EVENTS_RECD', function(e) {
		Ti.API.info('Handling event -- REMOTE_MSG_EVENTS_RECD --> ' + e.result);
		updateMsgTableViewDisplay(e.result);
		Ti.API.info('updateMsgTableViewDisplay: DONE');	
		Ti.API.info('Adding view=' + msgView + ' page=' + msgPage);	
		msgPage.visible = true;
	});
	
	Ti.App.addEventListener('SEARCH_RESULTS_RECD', function(e) {
		Ti.API.info('Handling event -- SEARCH_RESULTS_RECD --> ' + e.result);
		updateSearchTableViewDisplay(e.result);
	});
	
	//
	// display search form
	//
	buildSearchView(true);
	
	//
	// build msg view
	//
	buildMsgView(false);
};

init();
