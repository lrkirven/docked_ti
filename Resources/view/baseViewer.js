
	var Base = {}; // Base namespace
	
	Base.createPreloader = function(msg) {
		var pre = null;
		if (msg == null) {
			pre = Titanium.UI.createActivityIndicator({
				top: 120,
				left: 85,
				height: 150,
				width: 150,
				font: {
					fontFamily: model.myFont,
					fontSize: 13,
					fontWeight: 'bold'
				},
				color: css.getColor2(),
				style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
			});
		}
		else {
			pre = Titanium.UI.createActivityIndicator({
				top: 120,
				left: 85,
				height: 150,
				width: 150,
				message:msg,
				font: {
					fontFamily: model.myFont,
					fontSize: 13,
					fontWeight: 'bold'
				},
				color: css.getColor2(),
				style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
			});
		}
		return pre;
	};
	
	Base.buildRowCollection = function(msgEventList) {
		var i = 0;
		var msgEvent = null;
		var myDataRowList = [];
		var currentRow = null;
		var currentRowIndex = null;
		var username = null;
		var location = null;
		var msgTitle = null;
		var ppUrl = 'http://philestore1.phreadz.com/_users/2d/04/e4/16/bennycrime/2010/02/19/bennycrime_1266618797_60.jpg';
		
		if (msgEventList != null) {
			Ti.API.info('buildRowCollection: size: ' + msgEventList.length);
			for (i=0; i<msgEventList.length; i++) {
				//
				// data fields
				//
				msgEvent = msgEventList[i];
			
				//
				// if alot of people deem this message as obscene, just stop showing it
				//		
				if (msgEvent.badCounter > 3) {
					continue;
				}
				
				
				Ti.API.info('buildRowCollection: msgEvent= ' + msgEvent);
				username = msgEvent.username;
				Ti.API.info('buildRowCollection: username: ' + username);
				location = msgEvent.location;
				Ti.API.info('buildRowCollection: location: ' + location);
				msgTitle = 'Posted by ' + username + ' on ' + location;
				Ti.API.info('buildRowCollection: title: ' + msgTitle);
				
				//
				// create table row
				//
				var row = Ti.UI.createTableViewRow({
					selectedBackgroundColor:'#fff',
					backgroundColor:css.getColor0(),
					height:0,
					width:'auto',
					borderColor:css.getColor2(),
					className:'MsgEventRow' + i,
					clickName:'row',
					msgEvent:msgEvent,
					hasChild:true,
					renderer:'messageRenderer.js'
				});
				Ti.API.info('buildRowCollection: row=' + row);
				
				//
				// build message body
				//	
				appendProfilePhoto(row);
				var fontSize = 14;
				if (Titanium.Platform.name == 'android') {
					fontSize = 13;
				}
				Ti.API.info('buildRowCollection: Starting msg body');
				if (msgEvent.photoUrl == undefined) {
					Ti.API.info('buildRowCollection: BASIC msg body ...');
					appendMsgBody(row, fontSize);
				}
				else {
					Ti.API.info('buildRowCollection: PHOTO msg body ...');
					appendMsgBodyWithPhoto(row, fontSize);
				}
				
				var replyCounter = Ti.UI.createLabel({
					color: css.getColor3(),
					font: { fontSize: '10', fontWeight: 'bold', fontFamily: model.myFont },
					right: 0,
					top: 0,
					height: 20,
					width: 20,
					clickName: 'replyCounter',
					text: ''
				});
				if (msgEvent.commentCounter > 0) {
					replyCounter.text = '+' + msgEvent.commentCounter;
				} 
				Ti.API.info('buildRowCollection: replyCounter=' + replyCounter);
				row.add(replyCounter);
				// add row
				Ti.API.info('buildRowCollection: Adding row=' + row);
				myDataRowList.push(row);
			}
		}
		return myDataRowList;
	};
	
	
	
