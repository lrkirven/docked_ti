Ti.include('../util/msgs.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;

var stateDP =  [
	{ title:'Alaska Fishing', hasChild:true, leftImage:'../Fish.png', state:'AK' },
	{ title:'Arizona Fishing', hasChild:true, leftImage:'../Fish.png', state:'AZ' },
	{ title:'Arkansas Fishing', hasChild:true, leftImage:'../Fish.png', state:'AR' },
	{ title:'California Fishing', hasChild:true, leftImage:'../Fish.png', state:'CA' },
	{ title:'Colorado Fishing', hasChild:true, leftImage:'../Fish.png', state:'CO' },
	{ title:'Florida Fishing', hasChild:true, leftImage:'../Fish.png', state:'FL' },
	{ title:'Georgia Fishing', hasChild:true, leftImage:'../Fish.png', state:'GA' },
	{ title:'Idaho Fishing', hasChild:true, leftImage:'../Fish.png', state:'ID' },
	{ title:'Illinois Fishing', hasChild:true, leftImage:'../Fish.png', state:'IL' },
	{ title:'Indiana Fishing', hasChild:true, leftImage:'../Fish.png', state:'IN' },
	{ title:'Iowa Fishing', hasChild:true, leftImage:'../Fish.png', state:'IA' },
	{ title:'Maine Fishing', hasChild:true, leftImage:'../Fish.png', state: 'MA' },
	{ title:'Maryland Fishing', hasChild:true, leftImage:'../Fish.png', state:"MD" },
	{ title:'Michigan Fishing', hasChild:true, leftImage:'../Fish.png', state:'MI' },
	{ title:'Mississippi Fishing', hasChild:true, leftImage:'../Fish.png', state:'MS' },
	{ title:'Missouri Fishing', hasChild:true, leftImage:'../Fish.png', state:'MO' },
	{ title:'Montana Fishing', hasChild:true, leftImage:'../Fish.png', state:'MN' },
	{ title:'Nebraska Fishing', hasChild:true, leftImage:'../Fish.png', state:'NE' },
	{ title:'Nevada Fishing', hasChild:true, leftImage:'../Fish.png', state:'NV' },
	{ title:'New Hampshire Fishing', hasChild:true, leftImage:'../Fish.png', state:'NH' },
	{ title:'New Mexico Fishing', hasChild:true, leftImage:'../Fish.png', state:'NM' },
	{ title:'New York Fishing', hasChild:true, leftImage:'../Fish.png', state:'NY' },
	{ title:'Ohio Fishing', hasChild:true, leftImage:'../Fish.png', state:'OH' },
	{ title:'Oklahoma Fishing', hasChild:true, leftImage:'../Fish.png', state:'OK' },
	{ title:'Oregon Fishing', hasChild:true, leftImage:'../Fish.png', state:'OR' },
	{ title:'Pennsylvania Fishing', hasChild:true, leftImage:'../Fish.png', state:'PA' },
	{ title:'South Carolina Fishing', hasChild:true, leftImage:'../Fish.png', state:'SC' },
	{ title:'Tennessee Fishing', hasChild:true, leftImage:'../Fish.png', state:'TN' },
	{ title:'Texas Fishing', hasChild:true, leftImage:'../Fish.png', state:'TX' },
	{ title:'Utah Fishing', hasChild:true, leftImage:'../Fish.png', state:'UT'},
	{ title:'Virginia Fishing', hasChild:true, leftImage:'../Fish.png', state:'VA' },
	{ title:'Washington Fishing', hasChild:true, leftImage:'../Fish.png', state:'WA' },
	{ title:'West Virginia Fishing', hasChild:true, leftImage:'../Fish.png', state:'WV' },
	{ title:'Wisconsin Fishing', hasChild:true, leftImage:'../Fish.png', state:'WI'},
	{ title:'Wyoming Fishing', hasChild:true, leftImage:'../Fish.png', state:'WY'}
];

function init() {
	
	var tblHeader = Ti.UI.createView({ height:30, width:320 });
	var label = Ti.UI.createLabel({ 
		top:5,
		left:10,
   		text:'Fishing Reports', 
		font: { fontFamily:model.myFont, fontSize:20, fontWeight:'bold' },
   		// color:'#ffffff'
		color:CSSMgr.color2
	});
	tblHeader.add(label);
	
	// create table view
	var reportTbl = Titanium.UI.createTableView({
		data:stateDP, 
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
			stateTitle:e.rowData.title,
			barImage: '../Header.png'
		});
		w.model = model;
		Titanium.UI.currentTab.open(w, {animated:true});
		// windowList.push(w);
	});
	reportTbl.backgroundImage = '../dockedbg.png';
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
