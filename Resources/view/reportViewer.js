Ti.include('../util/msgs.js');
Ti.include('../util/common.js');
Ti.include('../util/tools.js');
Ti.include('../util/date.format.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var reportTbl = null;

var stateDP =  [
	{ title:'Alaska Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'AK' },
	{ title:'Arizona Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'AZ' },
	{ title:'Arkansas Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'AR' },
	{ title:'California Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'CA' },
	{ title:'Colorado Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'CO' },
	{ title:'Florida Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'FL' },
	{ title:'Georgia Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'GA' },
	{ title:'Idaho Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'ID' },
	{ title:'Illinois Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'IL' },
	{ title:'Indiana Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'IN' },
	{ title:'Iowa Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'IA' },
	{ title:'Maine Fishing', hasChild:true, leftImage:'../images/Fish.png', state: 'MA' },
	{ title:'Maryland Fishing', hasChild:true, leftImage:'../images/Fish.png', state:"MD" },
	{ title:'Michigan Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'MI' },
	{ title:'Mississippi Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'MS' },
	{ title:'Missouri Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'MO' },
	{ title:'Montana Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'MN' },
	{ title:'Nebraska Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'NE' },
	{ title:'Nevada Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'NV' },
	{ title:'New Hampshire Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'NH' },
	{ title:'New Mexico Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'NM' },
	{ title:'New York Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'NY' },
	{ title:'Ohio Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'OH' },
	{ title:'Oklahoma Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'OK' },
	{ title:'Oregon Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'OR' },
	{ title:'Pennsylvania Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'PA' },
	{ title:'South Carolina Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'SC' },
	{ title:'Tennessee Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'TN' },
	{ title:'Texas Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'TX' },
	{ title:'Utah Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'UT'},
	{ title:'Virginia Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'VA' },
	{ title:'Washington Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'WA' },
	{ title:'West Virginia Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'WV' },
	{ title:'Wisconsin Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'WI'},
	{ title:'Wyoming Fishing', hasChild:true, leftImage:'../images/Fish.png', state:'WY'}
];


Titanium.App.addEventListener('RECENT_REPORT_DATA_RECD', function(e) { 
	var i = 0;
	var list = e.result;
	var item = null;
	var map = {};
		
	for (i=0; i<list.length; i++) {
		item = list[i];		
		var lastReportDate = new Date(item.lastReportDate);
		var tm = lastReportDate.format('mmm dd yyyy');
		Ti.API.info('Adding pair state=' + item.state + ' tm=' + tm);
		map[item.state] = tm;	
	}	
	model.setReportActivityMap(map);
	var rows = buildReportTableRows(stateDP);
	reportTbl.data = rows;
});

function buildReportTableRows(dp) {
	var i = 0;
	var item = null;
	var MAX_ROW_WIDTH = 320;
	var list = [];
	
	var map = model.getReportActivityMap();
	
	for (i = 0; i < dp.length; i++) {
		item = dp[i];
		var row = Ti.UI.createTableViewRow({
			height:0,
			leftImage:'../images/Fish.png',
			width:MAX_ROW_WIDTH,
			className:'ReportRow' + i,
			clickName:'row',
			state:item.state,
			stateTitle:item.title,
			hasChild:true
		});
		
		var title = Ti.UI.createLabel({
			color: CSSMgr.color0,
			font: { fontSize: 14, fontWeight: 'bold', fontFamily: model.myFont },
			left: 45,
			top: 0,
			height: 25,
			width: 320,
			clickName: 'menuItemLabel',
			text: item.title
		});
		row.add(title);	
		
		var dateStr = '[ No Updates ]';
		if (map != null) {
			var d = map[item.state];	
			if (d != null) {
				dateStr = d;
			}
		}
		var lastUpdate = Ti.UI.createLabel({
			color: CSSMgr.color0,
			font: { fontSize: 11, fontWeight: 'bold', fontFamily: model.myFont },
			right: 10,
			bottom: 0,
			height: 25,
			textAlign: 'right',
			width: 300,
			clickName: 'lastUpdate',
			text: dateStr 
		});
		row.add(lastUpdate);	
		list.push(row);
	}
	return list;
};

function init() {
	var rows = [];	
	var map = model.getReportActivityMap();
	if (map == null) {
		var client = new RestClient();
		client.getRecentReportData();
	}
	else {
		rows = buildReportTableRows(stateDP);
	}
	
	var tblHeader = Ti.UI.createView({ height:30, width:320 });
	var label = Ti.UI.createLabel({ 
		top:5,
		left:10,
   		text:'Fishing Reports', 
		font: { fontFamily:model.myFont, fontSize:20, fontWeight:'bold' },
		color:CSSMgr.color2
	});
	tblHeader.add(label);
	
	// create table view
	reportTbl = Titanium.UI.createTableView({
		data:rows, 
		headerView:tblHeader,
		top:0,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		rowBackgroundColor:CSSMgr.color2
	});
	
	// create table view event listener
	reportTbl.addEventListener('click', function(e) {
		Ti.API.info('User selected to go here: ' + e.rowData.ptr);
		var w = Titanium.UI.createWindow({
			url:'showLakeList.js',
			backgroundColor:CSSMgr.color0,
   			barColor:CSSMgr.color0,
			state:e.rowData.state,
			stateTitle:e.rowData.stateTitle,
			barImage: '../images/Header.png'
		});
		w.model = model;
		Titanium.UI.currentTab.open(w, {animated:true});
		// windowList.push(w);
	});
	reportTbl.backgroundImage = '../images/Background.png';
	win.add(reportTbl);
	
	/*
	 * iAd 
	 */
	Base.attachiAd(win);
	
	mainInd = Titanium.UI.createActivityIndicator({
		top: 135,
		left: 135,
		height: 150,
		width: 50,
		style: Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
	});
	win.add(mainInd);
	
};

init();
