Ti.include('../util/tools.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;
var state = win.state;
var title = win.title;
var stateTitle = win.stateTitle;
var lakeTbl = null;
var preloader = null;

var b = Titanium.UI.createButton({title:'BACK'});
b.addEventListener('click', function() {
	win.close();
});
win.leftNavButton = b;


function convertRawData2TableItems(list) {
	var dp = [];	
	var i = 0;
	var obj = null;
	var val = null;

	for (i=0; i<list.length; i++) {
		val = list[i];
		obj = { 
			title:val.keyword, 
			state:val.state, 
			reportId:val.reportId, 
			timeDisplay:val.timeDisplay, 
			hasChild:true, 
			leftImage:'../phone_playmovie.png' };	
		dp.push(obj);
	}	
	return dp;
};

Titanium.App.addEventListener('ONE_REPORT_RECD', function(e) { 
	var w = Titanium.UI.createWindow({
		url: 'reportDetails.js',
		backgroundColor:css.getColor0(),
		barColor:css.getColor0(),
		title:e.result.keyword,
		report:{ title:e.result.keyword, timeDisplay:e.result.timeDisplay, reportBody:e.result.reportBody }
	});
	w.model = model;
	w.css = css;
	Titanium.UI.currentTab.open(w, { animated:true });
});

/**
 * This listener handles incoming requested report has been received.
 * 
 * @param {Object} e
 */
Titanium.App.addEventListener('SHORT_REPORT_DATA_RECD', function(e) { 
	preloader.hide();
	Ti.API.info('showLakeList: Got SHORT_REPORT_DATA_RECD event -- status=' + e.status);
	if (e.status == 0) {
		/*
		 * load incoming data into table
		 */
		if (e.result == null || e.result.length == 0) {
			Tools.reportMsg(model.getAppName(), 'No fishing report data for requested state ... Coming soon.');
		}
		else {
			var reports = convertRawData2TableItems(e.result);
			var reportTbl = model.getReportTable();
			reportTbl[state] = reports;
			lakeTbl.data = reports;
			/*
	 		 * create table view event listener
	 		 */
			lakeTbl.addEventListener('click', function(e) {
				var client = new RestClient();
				var shortReport = e.rowData;
				client.getReportByReportId(shortReport.reportId);
			});
		}
	}
	else {
		Tools.reportMsg(model.getAppName(), e.errorMsg);
	}
});


/**
 * Initial entry of the component
 */
function init() {
	Ti.API.info('showLakeList.init(): Entered ');
	
	var tblHeader = Ti.UI.createView({
		height: 30,
		width: 320
	});
	var label = Ti.UI.createLabel({
		top: 5,
		left: 10,
		text: stateTitle,
		font: { fontFamily: model.myFont, fontSize: 20, fontWeight: 'bold' },
		color: css.getColor2()
	});
	tblHeader.add(label);
	
	lakeTbl = Titanium.UI.createTableView({
		top: 0,
		headerView: tblHeader,
		style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		rowBackgroundColor: css.getColor2()
	});
	win.add(lakeTbl);
	lakeTbl.backgroundImage = '../dockedbg.png';
	
	var reportTbl = model.getReportTable();
	var reportData = reportTbl[state];
	/*
	 * go get report data for this state
	 */
	if (reportData == null) {
		Ti.API.info('showLakeList: Going to get the report data ...');
		preloader = Titanium.UI.createActivityIndicator({
			top: 120,
			left: 135,
			height: 150,
			width: 50,
			color: '#ffffff',
			style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
		});
		win.add(preloader);
		preloader.show();
	
		var client = new RestClient();
		Ti.API.info('showLakeList.init(): Going to get report data for state=' + state);
		client.getShortReportsByState(state);
	}
	/*
	 * if we have it, just show what we have 
	 */
	else {
		Ti.API.info('showLakeList: Using cached report data ... reportData=' + reportData);
		lakeTbl.data = reportData;
		/*
	 	 * create table view event listener
	 	 */
		lakeTbl.addEventListener('click', function(e) {
			var client = new RestClient();
			var shortReport = e.rowData;
			client.getReportByReportId(shortReport.reportId);
		});
	}
};

init();
