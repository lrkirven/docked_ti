Ti.include('../util/msgs.js');
Ti.include('../props/cssMgr.js');
Ti.include('../util/date.format.js');
Ti.include('../util/tools.js');
Ti.include('../model/modelLocator.js');

Ti.include('baseViewer.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var hs = win.hotSpot;
var distVal = null;
var bearingVal = null;
var compass = null;

function randomMove() {
	var val = new Date().getSeconds();
	var t = Ti.UI.create2DMatrix();
    t = t.rotate(360-val);
	compass.transform = t;
};

function adjustCompass() {
	var t = Ti.UI.create2DMatrix();
    t = t.rotate(360-e.heading.magneticHeading);
	compass.transform = t;
};

Titanium.App.addEventListener('REAL_POSITION_CHANGED', function(e) {
	var distBearObj = Tools.calcDistBearObject(model.getActualLat(), model.getActualLng(), hs.lat, hs.lng);
	distVal.text = distBearObj.distance + ' miles';
	bearingVal.text = distBearObj.bearing + '\u00B0';
});


/**
 * Initial entry
 */
function init() {
	Ti.API.info('showCompass: hotSpot --> ' + hs);
	Base.attachMyBACKButton(win);
	
	win.backgroundColor = CSSMgr.color2;

	var distBearObj = Tools.calcDistBearObject(model.getUserLat(), model.getUserLng(), hs.lat, hs.lng);
	var distLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Distance: ',
		font: { fontSize:13, fontFamily: model.myFont, fontWeight: 'bold' },
		top: 0,
		left: 0,
		width: 160,
		textAlign: 'right',
		height: 25 
	});
	win.add(distLbl);
	distVal = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: distBearObj.distance + ' miles',
		font: { fontSize:13, fontFamily: model.myFont, fontWeight: 'normal' },
		top: 0,
		left: 160,
		width: 160,
		textAlign: 'left',
		height: 25 
	});
	win.add(distVal);
	
	var bearingLbl = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: 'Bearing: ',
		font: { fontSize:13, fontFamily: model.myFont, fontWeight: 'bold' },
		top: 20,
		left: 0,
		width: 160,
		textAlign: 'right',
		height: 25 
	});
	win.add(bearingLbl);
	bearingVal = Titanium.UI.createLabel({
		color: CSSMgr.color0,
		text: distBearObj.bearing + '\u00B0',
		font: { fontSize:13, fontFamily: model.myFont, fontWeight: 'normal' },
		top: 20,
		left: 160,
		width: 160,
		textAlign: 'left',
		height: 25 
	});
	win.add(bearingVal);
	
	compass = Ti.UI.createImageView({
		image: '../images/clipart-compass-2.png',
		top: 15,
		left: 0,
		width: 320,
		height: 380,
		clickName: 'compass'
	});
	win.add(compass);
	
	if (Titanium.Geolocation.hasCompass) {
		
        Titanium.Geolocation.showCalibration = false;
        Titanium.Geolocation.headingFilter = 90;
 
        Ti.Geolocation.getCurrentHeading(function(e) {
			
            if (e.error) {
                currentHeading.text = 'error: ' + e.error;
                return;
            }
            var x = e.heading.x;
            var y = e.heading.y;
            var z = e.heading.z;
            var magneticHeading = e.heading.magneticHeading;
            var accuracy = e.heading.accuracy;
            var trueHeading = e.heading.trueHeading;
            var timestamp = e.heading.timestamp;
            Titanium.API.info('geo - current heading: ' + trueHeading);
			adjustCompass();
        });
 
        Titanium.Geolocation.addEventListener('heading',function(e) {
			
            if (e.error) {
                Titanium.API.info("error: " + e.error);
                return;
            }
 
            var x = e.heading.x;
            var y = e.heading.y;
            var z = e.heading.z;
            var magneticHeading = e.heading.magneticHeading;
            var accuracy = e.heading.accuracy;
            var trueHeading = e.heading.trueHeading;
            var timestamp = e.heading.timestamp;
            Titanium.API.info('geo - heading updated: ' + trueHeading);
			adjustCompass();
        });
    }
    else {
		Tools.reportMsg(Msgs.APP_NAME, 'Your device does not have a compass');	
    }
	// setInterval(randomMove, 12000);
};


init();

