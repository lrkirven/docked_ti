
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
	
	Base.buildLocationHeader = function(localFlag, remoteName) {
		var h = Ti.UI.createView({
			height: 50,
			width: 320,
			top: -100,
			borderColor: css.getColor0(),
			backgroundColor: css.getColor0()
		});
		
		var headerLbl0 = (localFlag ? Msgs.MY_LOCATION : Msgs.REMOTE_LOCATION);
		var label0 = Ti.UI.createLabel({
			text: headerLbl0,
			top: 0,
			left: 10,
			height: 20,
			font: { fontFamily: model.myFont, fontSize: 11, fontWeight: 'normal' },
			color: '#fff'
		});
	
		var displayName = null;	
		if (model.getCurrentUser() != null) {
			displayName = model.getCurrentUser().displayName;	
		}
		else {
			displayName = Msgs.ANONYMOUS;
		}
		var userLabel = Ti.UI.createLabel({
			text: displayName, 
			top: 0,
			width: 100,
			right: 10,
			textAlign: 'right',
			height: 20,
			font: { fontFamily: model.myFont, fontSize: 11, fontWeight: 'normal' },
			color: '#fff'
		});
	
		var countDisplay = '';
		if (model.getCurrentLake() != null) {
			countDisplay = model.getCurrentLake().localCount + ' USER(S)';	
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
	
		/*
		 * handle case when user is inside of a lake zone
		 */	
		if (localFlag) {
			var target = model.getCurrentLake();
			if (target != undefined) {
				selectedLake = Ti.UI.createLabel({
					text: target.name,
					top: 15,
					left: 10,
					height: 25,
					font: {
						fontFamily: model.myFont,
						fontSize: 16,
						fontWeight: 'bold'
					},
					color: css.getColor4()
				});
			}
			else {
				selectedLake = Ti.UI.createLabel({
					text: Msgs.OUT_OF_ZONE,
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
		}
		/*
		 * handle user trying to visit another lake
		 */
		else {
			selectedLake = Ti.UI.createLabel({
				text: remoteName,
				top: 15,
				left: 10,
				height: 25,
				font: {
					fontFamily: model.myFont,
					fontSize: 16,
					fontWeight: 'bold'
				},
				color: css.getColor4()
			});
		}
		
		//
		// add items to table header
		//
		h.add(label0);
		h.add(selectedLake);
		h.add(userLabel);
		h.add(userCountLbl);
		
		return h;
		
	};
	
