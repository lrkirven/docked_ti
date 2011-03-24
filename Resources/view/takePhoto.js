Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var parentWin = win.parentWin;


Titanium.Media.showCamera({
	success:function(event) {
		var w = 720;
		var h = 720;
		var now = new Date();
		var cropRect = event.cropRect;
		var imgData = event.media.imageAsResized(w,h)
		model.setPendingRawImage(imgData);
		win.close();
	},
	cancel:function() {
		win.close();
	},
	error:function(error) {
		// create alert
		var a = Titanium.UI.createAlertDialog({title:Msgs.APP_NAME});
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

	