Ti.include('../model/modelLocator.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;

var lakeDP =  [
	{ title:'Anderson Ranch', hasChild:true, leftImage:'../phone_playmovie.png', state:'ID' },
	{ title:'Bear Lake', hasChild:true, leftImage:'../phone_playmovie.png', state:'ID' },
	{ title:'Jimmy Smith', hasChild:true, leftImage:'../phone_playmovie.png', state:'ID' },
	{ title:'Brownlee Reservoir', hasChild:true, leftImage:'../phone_playmovie.png', state:'ID' },
];

function init() {
	
	var lakeTbl = Titanium.UI.createTableView({
		data:lakeDP, 
		top:0,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
		backgroundColor:css.getColor2(),
		rowBackgroundColor:css.getColor2()
	});
	
	// create table view event listener
	lakeTbl.addEventListener('click', function(e) {
		var w = Titanium.UI.createWindow({
			url:'reportDetails.js',
			backgroundColor:css.getColor0(),
   			barColor:css.getColor0(),
			title:e.rowData.title
		});
		w.model = model;
		w.css = css;
		Titanium.UI.currentTab.open(w, {animated:true});
		windowList.push(w);
	});
	win.add(lakeTbl);
};

init();
