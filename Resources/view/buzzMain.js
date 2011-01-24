Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var css = win.css;
var windowList = [];
var currentLocationLabel = null;
var buzzMenu = null;
var inPolygonMM = null;
var outPolygonMM = null;
var userCountLbl = null;
var mainInd = null;

function check4NewMsgEvents() {
	var client = new RestClient();
	var activeLake = model.getCurrentLake();
	if (activeLake != null) {
		Ti.API.info('check4MsgEvent(): resourceId ---> ' + activeLake.id);
		client.getLocalMsgEvents(activeLake.id);
	}
	else {
		Ti.API.info('check4MsgEvent(): Not in a region to view messages!!!!');
		Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { result:[] });
	}
};

function getMyFacebookInfo() {
	var query = "SELECT uid, name, pic_square, status FROM user where uid = " + Titanium.Facebook.getUserId() ;
	Ti.API.info('user id ' + Titanium.Facebook.getUserId());
	Titanium.Facebook.query(query, function(r) {
		var data = [];
		if (r.data.length > 0) {
			var info = r.data[0];	
			if (info.pic_square != null) {
				Ti.API.info('fb profile url ---> ' + info.pic_square);
				model.setFBProfileUrl(info.pic_square);
			}
			if (info.status != null && info.status.message != null) {
				Ti.API.info('fb status ---> ' + info.status.message);
				model.setFBStatus(info.status.message);
			}
			else {
				Ti.API.info('fb status ---> EMPTY');
				model.setFBStatus(null);
			}
		}
	});	
};

/**
 * This method initializes the buzz main menu for user selections.
 */
function init() {
	
	mainInd = Titanium.UI.createActivityIndicator({
		top: 135,
		left: 135,
		height: 150,
		width: 50,
		message: 'Loading ...',
		style: Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
	});
	win.add(mainInd);
	Ti.API.info('Show buzzMain indicator ...');
	mainInd.show();

	win.touchEnabled = false;
	
	inPolygonMM = [{
		title: 'Browse Buzz',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'messageViewer.js'
	}, {
		title: 'Map Buzz',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'buzzOnMapViewer.js'
	}, {
		title: 'Post Buzz',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'composeMsg.js'
	}, {
		title: 'Visit other Lakers',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'remoteViewer.js'
	}];
	
	inPolygonAnonymousMM = [{
		title: 'Browse Buzz',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'messageViewer.js'
	}, {
		title: 'Map Buzz',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'buzzOnMapViewer.js'
	}, {
		title: 'Visit other Lakers',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'remoteViewer.js'
	}];
	
	outPolygonMM = [{
		title: 'Visit other lakes',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'remoteViewer.js'
	}];
	
	/*
	Titanium.Geolocation.addEventListener('location', function(evt){
		if (evt.error) {
			Ti.API.info('GEO ERROR:' + JSON.stringify(evt.error));
			return;
		}
		var lat = evt.coords.latitude;
		var lng = evt.coords.longitude;
		var timestamp = evt.coords.timestamp;
		
		if (!model.isUserLocationSame(lat, lng)) {
			currentLocationLabel.text = "[ No Lake Found ... ]";
			currentLocationLabel.color = css.getColor3();
			Titanium.API.info('geo - location updated: ' + new Date(timestamp) + ' lng ' + lng + ' lat ' + lat);
			model.setUserLng(lng);
			model.setUserLat(lat);
			Ti.API.info('new lat: ' + lat);
			Ti.API.info('new lng: ' + lng);
			
			var client = new RestClient();
			var llId = 'ABC123';
			var user = model.getCurrentUser();
			lat = 32.85;
			lng = -96.50;
			client.ping(user.id, lat, lng);
			mainInd.show();
		}
	});
	*/
	
	Titanium.App.addEventListener('LOCATION_CHANGED', function(e){
		Ti.API.info('Handle LOCATION_CHANGED event ...');
		if (model.getCurrentLake() != null) {
			currentLocationLabel.text = model.getCurrentLake().name;
			currentLocationLabel.color = css.getColor4();
			buzzMenu.data = (model.getCurrentUser() == null ? inPolygonAnonymousMM : inPolygonMM);
			var countDisplay = model.getCurrentLake().localCount + ' Laker(s)';
			userCountLbl.text = countDisplay;
			win.touchEnabled = true;
		}
		else {
			currentLocationLabel.text = "[ No Lake Found ... ]";
			userCountLbl.text = '';
			currentLocationLabel.color = css.getColor3();
			buzzMenu.data = outPolygonMM;
			win.touchEnabled = true;
		}
		mainInd.hide();
	});
	
	Ti.API.info('buzzMain.init(): Entered ');
	
	var h = Ti.UI.createView({
		height: 50,
		top: 0,
		borderColor: css.getColor2(),
		backgroundColor: css.getColor0()
	});
	
	var headerLbl0 = 'My Location: ';
	var label0 = Ti.UI.createLabel({
		text: headerLbl0,
		top: 0,
		left: 10,
		height: 20,
		font: {
			fontFamily: model.myFont,
			fontSize: 11,
			fontWeight: 'normal'
		},
		color: '#fff'
	});
	
	var target = model.getCurrentLake();
	var label1 = undefined;
	if (target != undefined) {
		currentLocationLabel = Ti.UI.createLabel({
			text: target.name,
			top: 15,
			left: 10,
			height: 25,
			font: {
				fontFamily: model.myFont,
				fontSize: 16,
				fontWeight: 'bold'
			},
			color: css.getColor2()
		});
	}
	else {
		currentLocationLabel = Ti.UI.createLabel({
			text: "[ No Lake Found ... ]",
			top: 15,
			left: 10,
			height: 25,
			font: {
				fontFamily: model.myFont,
				fontSize: 16,
				fontWeight: 'bold'
			},
			color: css.getColor3()
		});
	}
	
	var displayName = null;
	if (model.getCurrentUser() != null) {
		displayName = model.getCurrentUser().displayName;
	}
	else {
		displayName = "Anonymous";
	}
	var userLabel = Ti.UI.createLabel({
		text: displayName,
		top: 0,
		width: 100,
		right: 10,
		height: 20,
		textAlign: 'right',
		font: {
			fontFamily: model.myFont,
			fontSize: 11,
			fontWeight: 'normal'
		},
		color: '#fff'
	});
	var countDisplay = '';
	if (model.getCurrentLake() != null) {
		countDisplay = model.getCurrentLaAke().localCount + ' Laker(s)';
	}
	userCountLbl = Ti.UI.createLabel({
		text: countDisplay,
		top: 25,
		width: 100,
		right: 10,
		textAlign: 'right',
		height: 20,
		font: { fontFamily: model.myFont, fontSize: 11, fontWeight: 'normal' },
		color: '#fff'
	});
	
	h.add(label0);
	h.add(currentLocationLabel);
	h.add(userLabel);
	h.add(userCountLbl);
	win.add(h);

	var baseColor = css.getColor0();
	
	// create table view
	buzzMenu = Titanium.UI.createTableView({
		top:45,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		backgroundColor:css.getColor2(),
		rowBackgroundColor:css.getColor2()
	});

	// create table view event listener
	buzzMenu.addEventListener('click', function(e) {
		Ti.API.info('User selcted to go here: ' + e.rowData.ptr);
		if (e.rowData.ptr) {
			var w = Titanium.UI.createWindow({
				url:e.rowData.ptr,
				backgroundColor:baseColor,
    			barColor:baseColor,
				title:e.rowData.title
			});
			w.model = model;
			w.css = css;
			Titanium.UI.currentTab.open(w, {animated:true});
			windowList.push(w);
		}
	});
	win.add(buzzMenu);
	
	// iAd integration	
	var iads = Ti.UI.iOS.createAdView({
    	width: 'auto',
    	height: 'auto',
    	bottom: -100,
    	borderColor: '#000000',
    	backgroundColor: '#000000'});
    t1 = Titanium.UI.createAnimation({bottom:0, duration:750});
    iads.addEventListener('load', function(){
        iads.animate(t1);
    });
    win.add(iads);
	
	
	
	if (Titanium.Facebook.isLoggedIn()) {
		getMyFacebookInfo();
	}
	
};

init();
