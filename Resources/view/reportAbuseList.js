Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/tools.js');
Ti.include('../util/geo.js');
Ti.include('../props/cssMgr.js');
Ti.include('../util/hotspot.js');
Ti.include('../model/modelLocator.js');
Ti.include('../model/modelLocator.js');
Ti.include('../client/restClient.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var msgEvent = win.msgEvent;
var submitBtn = null;
var abuseReport = null;

var abuseChoices = [{
		title: 'Spam',
		color: '#fff',
		selectedColor: CSSMgr.color0,
	}, {
		title: 'Hateful',
		color: '#fff',
		selectedColor: CSSMgr.color0,
	}, {
		title: 'Violent behavior',
		color: '#fff',
		selectedColor: CSSMgr.color0,
	},{
		title: 'Nudity or sexual content',
		color: '#fff',
		selectedColor: CSSMgr.color0,
	}
];
	
Titanium.App.addEventListener('REPORT_ABUSE_RESP', function(e) {
	Tools.reportMsg(Msgs.APP_NAME, Msgs.REPORT_THANKS);	
	win.close();
});

/**
 * Initial entry
 */
function init() {
	
	// create table view
	var abuseTable = Titanium.UI.createTableView({
		left:0,
		top:0,
		data: abuseChoices,
		separatorColor:CSSMgr.color2,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		backgroundColor:CSSMgr.color0,
		height:175,
		allowsSelection: true
	});
	abuseTable.addEventListener('click', function(e) {
		Ti.API.info('User selected ---> ' + e.rowData.title);
		abuseReport = e.rowData.title;
		submitBtn.enabled = true;
	});
	win.add(abuseTable);
	win.backgroundImage = '../images/Background.png';
	
	submitBtn = Titanium.UI.createButton({
   		title:'Report',
		enabled:false,
		color:CSSMgr.color2,
		backgroundColor:CSSMgr.color0,
  		font:{fontSize:12, fontFamily:model.myFont, fontWeight:'bold'},
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
		width:100,
  		height:30,
		bottom:0,
		right:0
	});
	submitBtn.addEventListener('click', function(e) {
		var client = new RestClient();
		var user = model.getCurrentUser();
		var report = null;
		if (msgEvent.photoUrl == null) {
			report = "BuzzMsg [ resKey=" + msgEvent.resKey + " id=" + msgEvent.msgId + " ]\n" +
			"Msg=" + msgEvent.messageData + "\n" +
			"Abuse=" +
			abuseReport +
			"\n" +
			"Local=" +
			new Date();
		}
		else {
			report = "BuzzMsg [ resKey=" + msgEvent.resKey + " id=" + msgEvent.msgId + " ]\n" +
			"Msg=" + msgEvent.messageData + "\n" +
			"Abuse=" + abuseReport + "\n" +
			"PhotoUrl=" + msgEvent.photoUrl + "\n" +
			"Local=" + new Date();
		}
		client.reportAbuse(user.id, report);
	});
	win.setRightNavButton(submitBtn);
};


init();
