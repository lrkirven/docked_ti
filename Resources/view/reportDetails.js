Ti.include('../model/modelLocator.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;
var report = win.report;

var b = Titanium.UI.createButton({title:'BACK'});
b.addEventListener('click', function() {
	win.close();
});
win.leftNavButton = b;

/**
 * Initial entry
 */
function init() {
	var webview = Ti.UI.createWebView();
	webview.url = 'reportDetails.html';
	webview.scalesPageToFit = true;
	win.add(webview);
	Ti.API.info('reportDetails: report : ' + report.title);
	setTimeout(function(e) {
		Ti.App.fireEvent("LOAD_REPORT", { title:report.title, timeDisplay:report.timeDisplay, reportBody:report.reportBody });
	}, 3000); 
};

init();
