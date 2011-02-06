Ti.include('../model/modelLocator.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;
var report = win.report;
var webview = null;
var mainInd = null;

var b = Titanium.UI.createButton({title:'BACK'});
b.addEventListener('click', function() {
	win.close();
});
win.leftNavButton = b;

Titanium.App.addEventListener('LOAD_REPORT_COMPLETE', function(e) { 
	webview.show();
	mainInd.hide(); 
});

/**
 * Initial entry
 */
function init() {
	mainInd = Titanium.UI.createActivityIndicator({
		top: 120,
		left: 135,
		height: 150,
		width: 50,
		message: 'Retrieving report ...',
		color:'#ffffff',
		style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
	});
	win.add(mainInd);
	
	webview = Ti.UI.createWebView();
	webview.hide();
	webview.url = 'reportDetails.html';
	webview.scalesPageToFit = true;
	win.add(webview);
	Ti.API.info('reportDetails: report : ' + report);
	Ti.API.info('reportDetails: title : ' + report.title);
	setTimeout(function(e) {
		Ti.App.fireEvent("LOAD_REPORT", { title:report.title, timeDisplay:report.timeDisplay, reportBody:report.reportBody });
	}, 3000);
	mainInd.show(); 
};

init();
