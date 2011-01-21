var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;

Ti.include('../model/modelLocator.js');

var data = [];

Ti.API.info('Entering browseExisting - ' + win);

Titanium.Media.openPhotoGallery({

	success:function(event) {
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
	saveToPhotoGallery:true,
	allowImageEditing:true
});


//
// create cancel button
//
var closeBtn = Titanium.UI.createButton({
	title:'Close',
	color:css.getColor0(),
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
	