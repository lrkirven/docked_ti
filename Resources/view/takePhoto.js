var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;
var parentWin = win.parentWin;

Ti.include('../model/modelLocator.js');

Titanium.Media.showCamera({
	success:function(event) {
		var now = new Date();
		var cropRect = event.cropRect;
		var imgData = event.media;
		model.setPendingRawImage(imgData);
		win.close();
	},
	cancel:function() {
		win.close();
	},
	error:function(error) {
		// create alert
		var a = Titanium.UI.createAlertDialog({title:model.getAppName()});
		// set message
		if (error.code == Titanium.Media.NO_CAMERA) {
			a.setMessage('Device does not have video recording capabilities');
		}
		else {
			a.setMessage('Unexpected error: ' + error.code);
		}
		// show alert
		a.show();
		win.close();
	},
	showControls:true,
	allowImageEditing:true
});

	