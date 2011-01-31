Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');
Ti.include('../util/tools.js');

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


/**
 * This method goes to server to check for Buzz messages in your current lake zone.
 */
function check4NewMsgEvents() {
	var client = new RestClient();
	var activeLake = model.getCurrentLake();
	if (activeLake != null) {
		Ti.API.info('check4MsgEvent(): resourceId ---> ' + activeLake.id);
		client.getLocalMsgEvents(activeLake.id);
	}
	else {
		Ti.API.info('check4MsgEvent(): Not in a region to view messages!!!!');
		Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { result:[], status:0 });
	}
};

/**
 * This method goes to Facebook to get your profile pic and other facebook information of 
 * logged in user.
 */
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
	
	win.touchEnabled = false;
	
	inPolygonMM = [{
		title: 'Browse',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'messageViewer.js'
	}, {
		title: 'Map',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'buzzOnMapViewer.js'
	}, {
		title: 'Post',
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
		title: 'Browse',
		hasChild: true,
		leftImage: '../phone_playmovie.png',
		ptr: 'messageViewer.js'
	}, {
		title: 'Map',
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
	
	Titanium.App.addEventListener('LOCATION_CHANGED', function(e){
		Ti.API.info('Handle LOCATION_CHANGED event ...');
		if (model.getCurrentLake() != null) {
			currentLocationLabel.text = model.getCurrentLake().name;
			currentLocationLabel.color = css.getColor4();
			buzzMenu.data = (model.getCurrentUser() == null ? inPolygonAnonymousMM : inPolygonMM);
			var countDisplay = model.getCurrentLake().localCount + ' Local(s)';
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
		height:50,
		left:0,
		top:0,
		borderColor: css.getColor0(),
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
		width: 150,
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
		countDisplay = model.getCurrentLake().localCount + ' Local(s)';
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
	
	var tblHeader = Ti.UI.createView({ height:30, width:320 });
	var label = Ti.UI.createLabel({ 
		top:5,
		left:10,
   		text:'Buzz', 
		font: { fontFamily:model.myFont, fontSize:20, fontWeight:'bold' },
   		// color:'#ffffff'
		color:css.getColor2()
	});
	tblHeader.add(label);

	// create table view
	buzzMenu = Titanium.UI.createTableView({
		top:50,
		headerView:tblHeader,
		/*
		font: { fontFamily:model.myFont, fontSize:15, fontWeight:'normal', color:css.getColor2() },
		fontWeight:'normal',
		fontSize:12,
		*/
		scrollable:false,
		moving:false,
		style:Titanium.UI.iPhone.TableViewStyle.GROUPED,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		rowBackgroundColor:css.getColor2()
		// rowBackgroundColor:'#ffffff'
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
	
	mainInd = Titanium.UI.createActivityIndicator({
		top: 125,
		left: 135,
		height: 150,
		width: 50,
		color:'#ffffff',
		message: 'Initializing ...',
		style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
	});
	win.add(mainInd);
	Ti.API.info('Show buzzMain indicator ...');
	mainInd.show();
	
	if (model.getCurrentLake() != null) {
		Ti.App.fireEvent('LOCATION_CHANGED', {});
	}
	buzzMenu.backgroundImage = '../dockedbg.png';
};

init();
