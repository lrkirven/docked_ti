Ti.include('../util/msgs.js');
Ti.include('../util/tools.js');
Ti.include('../props/cssMgr.js');
Ti.include('../model/modelLocator.js');

var win = Ti.UI.currentWindow;
var model = win.model;

var data = [];

Ti.API.info('Entering browseExisting - ' + win);

Titanium.Media.openPhotoGallery({

	success:function(event) {
		if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
			var cropRect = event.cropRect;
			var imgData = event.media;
			model.setPendingRawImage(imgData);
		}
		else {
			Tools.reportMsg(Msgs.APP_NAME, 'Docked currently only supports uploading photos');
		}
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
	saveToPhotoGallery:true,
	allowImageEditing:true
});


//
// create cancel button
//
var closeBtn = Titanium.UI.createButton({
	title:'Close',
	color:CSSMgr.color0,
	bottom:10,
	right:30,
	height:30,
	width:125
});
win.add(closeBtn);
closeBtn.addEventListener('click', function() {
	Ti.API.info('Trying to close window ...');
	win.close();
});
	