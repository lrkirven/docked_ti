Ti.include('../model/modelLocator.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;

var webview = Ti.UI.createWebView();
webview.url = 'reportDetails.html';
webview.scalesPageToFit = true;
win.add(webview);

function init() {
};

init();
