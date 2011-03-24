
	var Base = {}; // Base namespace
	
	/**
	 * This method displays a command activity indicator for this application.
	 * 
	 * @param {Object} msg
	 */
	Base.showPreloader = function(currentWin, msg, styleFlag) {
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
				color: CSSMgr.color2,
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
				color: CSSMgr.color2,
				style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
			});
		}
		if (styleFlag) {
			pre.style = Titanium.UI.iPhone.ActivityIndicatorStyle.DARK;
		}
		currentWin.add(pre);
		pre.show();
		return pre;
	};
	
	Base.createProfilePic = function(top, left) {
		var defaultProfilePic = Ti.UI.createImageView({
			image: '../images/Profile.png',
			backgroundImage: '../images/Background.png',
			// backgroundColor:CSSMgr.color0,
			borderColor:CSSMgr.color2,
			top: top,
			left: left,
			width:50,
			height:50,
			clickName:'defaultIDImage'
		});	
		return defaultProfilePic;
	};
	
	/**
	 * This method builds a message view without an attached photo to be added to an individual 
	 * row inside of the table.
	 * 
	 * @param {Object} row
	 * @param {Object} fontSize
	 */
	Base.appendMsgBody = function(row, fontSize) {
		var msgEvent = row.msgEvent;
		var msgBody = null;
		var distBearLbl = null;
		var userLocale = null;
		var userMsg = null;
		
		
		var distBearVal = Tools.calcDistBear(model.getUserLat(), model.getUserLng(), msgEvent.lat, msgEvent.lng);
		var distVal = Tools.calcDist(model.getUserLat(), model.getUserLng(), msgEvent.lat, msgEvent.lng);
		row.msgEvent.distBearVal = distBearVal;
		row.height = 85;
		
		if (msgEvent.messageData != null && msgEvent.messageData.length > 35) {
			
			Ti.API.info('appendMsgBody(): LONG MSG');
			
			msgBody = Ti.UI.createView({
				backgroundColor:CSSMgr.color0,
				left:60,
				top:0,
				height:65,
				width:230,
				clickName:'msgBody'
			});
			
			userMsg = Ti.UI.createLabel({
				color: '#fff',
				font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
				left: 0,
				top: 5,
				height: 55,
				width: 220,
				clickName: 'userMsg',
				text: msgEvent.messageData
			});
			msgBody.add(userMsg);
			row.add(msgBody);	
			
			userLocale = Ti.UI.createLabel({
				color:CSSMgr.color0,
				font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
				left:0,
				bottom:0,
				height:20,
				textAlign:'center',
				width:320,
				backgroundColor:CSSMgr.color2,
				clickName:'userLocale',
				text:(msgEvent.username + ', ' + msgEvent.timeDisplay + ', ' + distVal)
			});
			row.add(userLocale);
		}
		else {
			
			Ti.API.info('appendMsgBody(): SHORT MSG');
			
			msgBody = Ti.UI.createView({
				backgroundColor:CSSMgr.color0,
				left:60,
				top:0,
				height:65,
				width:230,
				clickName:'msgBody'
			});
			
			userMsg = Ti.UI.createLabel({
				color: '#fff',
				font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
				left: 0,
				top: 5,
				height: 25,
				width: 220,
				clickName: 'userMsg',
				text: msgEvent.messageData
			});
			msgBody.add(userMsg);
			row.add(msgBody);	
			
			userLocale = Ti.UI.createLabel({
				color:CSSMgr.color0,
				font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
				left:0,
				bottom:0,
				height:20,
				textAlign:'center',
				width:320,
				clickName:'userLocale',
				backgroundColor:CSSMgr.color2,
				text:(msgEvent.username + ', ' + msgEvent.timeDisplay + ', ' + distVal)
			});
			row.add(userLocale);
		}
		
	}; 
	
	Base.convertImageForDisplay = function(url) {
		Ti.API.info('imageHack(): url=' + url);
		var tempImg = Ti.UI.createImageView({
			image: url 
		});
		var blob = tempImg.toImage();
		blob = blob.imageAsThumbnail(50);
		var t = Ti.UI.create2DMatrix().rotate(-90);
		var photo = Ti.UI.createImageView({
  			image: blob,
			transform: t
		});
		return photo;
	};
	
	/**
	 * This method builds a message view with photo to be added to a row inside of a table.
	 * 
	 * @param {Object} row
	 * @param {Object} fontSize
	 */
	Base.appendMsgBodyWithPhoto = function(row, fontSize) {
		var msgBody = null;
		var msgPhoto = null;
		var userLocale = null;
		var msgEvent = row.msgEvent;
		
		var distBearVal = Tools.calcDistBear(model.getUserLat(), model.getUserLng(), msgEvent.lat, msgEvent.lng);
		var distVal = Tools.calcDist(model.getUserLat(), model.getUserLng(), msgEvent.lat, msgEvent.lng);
		row.msgEvent.distBearVal = distBearVal;
		row.height = 85;
		
		if (msgEvent.messageData != null && msgEvent.messageData.length > 25) {
			
			Ti.API.info('appendMsgBodyWithPhoto(): LONG MSG');
			
			msgBody = Ti.UI.createView({
				backgroundColor: CSSMgr.color0,
				left: 60,
				top: 0,
				height: 90,
				width: 230,
				clickName: 'msgBody'
			});
			
			var imageWrapper = Ti.UI.createView({
				borderColor: CSSMgr.color2,
				width: 50,
				height: 50,
				top: 5,
				left: 0,
			});
			msgPhoto = Base.convertImageForDisplay(msgEvent.photoUrl);
			imageWrapper.add(msgPhoto);
			msgBody.add(imageWrapper);
			
			userMsg = Ti.UI.createLabel({
				color: CSSMgr.color2,
				font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
				left: 60,
				top: 5,
				height: 50,
				width: 160,
				clickName: 'comment',
				text: msgEvent.messageData
			});
			msgBody.add(userMsg);
			row.add(msgBody);	
			
			userLocale = Ti.UI.createLabel({
				color:CSSMgr.color0,
				font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
				left:0,
				bottom:0,
				height:20,
				textAlign:'center',
				width:320,
				backgroundColor:CSSMgr.color2,
				clickName:'userLocale',
				text:(msgEvent.username + ', ' + msgEvent.timeDisplay + ', ' + distVal)
			});
			row.add(userLocale);
		}
		else {
			
			Ti.API.info('appendMsgBodyWithPhoto(): SHORT MSG url=' + msgEvent.photoUrl);
			
			msgBody = Ti.UI.createView({
				backgroundColor: CSSMgr.color0,
				left: 60,
				top: 0,
				height: 65,
				width: 230,
				clickName: 'msgBody'
			});
			
			var imageWrapper = Ti.UI.createView({
				borderColor: CSSMgr.color2,
				width: 50,
				height: 50,
				top: 5,
				left: 0,
			});
			msgPhoto = Base.convertImageForDisplay(msgEvent.photoUrl);
			imageWrapper.add(msgPhoto);
			msgBody.add(imageWrapper);
			
			userMsg = Ti.UI.createLabel({
				color: '#fff',
				font: { fontSize: fontSize, fontWeight: 'normal', fontFamily: model.myFont },
				left: 60,
				top: 5,
				height: 25,
				width: 160,
				clickName: 'userMsg',
				text: msgEvent.messageData
			});
			msgBody.add(userMsg);
			row.add(msgBody);	
			
			userLocale = Ti.UI.createLabel({
				color:CSSMgr.color0,
				font:{fontSize:11, fontWeight:'normal', fontFamily:model.myFont},
				left:0,
				bottom:0,
				height:20,
				textAlign:'center',
				width:320,
				backgroundColor:CSSMgr.color2,
				clickName:'userLocale',
				text:(msgEvent.username + ', ' + msgEvent.timeDisplay + ', ' + distVal)
			});
			row.add(userLocale);
		}
	}; 
	
	/**
	 * This method adds the author's profile photo if they have one to their message view (or entry).
	 * 
	 * @param {Object} row
	 */
	Base.appendProfilePhoto = function(row) {
		var msgEvent = row.msgEvent;
		if (msgEvent.profileUrl == undefined) {
			var defaultIDImage = null;
			defaultIDImage = Base.createProfilePic(5, 5);
			row.add(defaultIDImage);
		}
		else {
			var userProfilePhoto = Ti.UI.createImageView({
				image: msgEvent.profileUrl,
				backgroundColor: CSSMgr.color0,
				borderColor: CSSMgr.color1,
				top:5,
				left:5,
				width:50,
				height:50,
				clickName:'photo'
			});
			row.add(userProfilePhoto);
		}
	};
	
	Base.buildHotSpotRows = function(dataList, rendererFile) {
		var i = 0;
		var hs = null;
		var bigFontSize = 13;
		var smallFontSize = 10;
		var myDataRowList = [];
		var currentRow = null;
		var currentRowIndex = null;
		var username = null;
		var location = null;
		var msgTitle = null;
		
		if (dataList != null) {
			Ti.API.info('buildHotSpotRows: size: ' + dataList.length);
			for (i=0; i<dataList.length; i++) {
				
				hs = dataList[i];
		
				/*
				 * table row
				 */	
				var row = Ti.UI.createTableViewRow({
					selectedBackgroundColor:CSSMgr.color2,
					backgroundColor:CSSMgr.color0,
					height:80,
					width:300,
					borderColor:CSSMgr.color2,
					borderRadius: 20,
					className:'HotSpotRow' + i,
					clickName:'row',
					hotSpot:hs,
					hasChild:true,
					renderer:rendererFile
				});
				if (hs.header != null) {
					row.header = hs.header;
				}
				Ti.API.info('buildHotSpotRows: row=' + row);
				
				var dataPanel = Ti.UI.createView({
					left:0,
					top:0,
					height:'auto',
					width:300,
					clickName:'hsBody'
				});
			
				var descLbl = Ti.UI.createLabel({
					color: CSSMgr.color2,
					font: { fontSize: bigFontSize, fontWeight: 'bold', fontFamily: model.myFont },
					left: 10,
					top: 0,
					height: 25,
					width: 220,
					clickName: 'hsDesc',
					text: hs.desc
				});
				dataPanel.add(descLbl);
			
				var locationLbl = Ti.UI.createLabel({
					color: CSSMgr.color2,
					font: { fontSize: smallFontSize, fontWeight: 'bold', fontFamily: model.myFont },
					left: 10,
					top: 20, 
					height: 25,
					width: 150,
					clickName: 'hsLocation',
					text: hs.location
				});
				dataPanel.add(locationLbl);
				
				var latlngPanel = Ti.UI.createView({
					left: 0,
					right: 0,
					top: 40,
					height: 40,
					width: 300,
					clickName:'latlngBody'
				});
			
				var latlngStr = Geo.toLat(hs.lat, 'dms', 2) + ' - ' + Geo.toLon(hs.lng, 'dms', 2);	
				var latlngText = Titanium.UI.createLabel({
					color: CSSMgr.color2,
					text: latlngStr,
					font: { fontSize:smallFontSize, fontFamily: model.myFont, fontWeight: 'bold' },
					top: 0,
					left: 10,
					width: 300,
					textAlign: 'left',
					height:20 
				});
				latlngPanel.add(latlngText);
				
				var distBearVal = Tools.calcDistBear(model.getUserLat(), model.getUserLng(), hs.lat, hs.lng);
				var distBearText = Titanium.UI.createLabel({
					color: CSSMgr.color2,
					text: distBearVal,
					font: { fontSize:smallFontSize, fontFamily: model.myFont, fontWeight: 'bold' },
					top: 15,
					left: 10,
					width: 150,
					textAlign: 'left',
					height:20 
				});
				latlngPanel.add(distBearText);
				
				var tmFormatted = new Date(hs.createDate);
				var tmLabel = Titanium.UI.createLabel({
					color: CSSMgr.color2,
					text: tmFormatted.format('mmm dd yyyy HH:MM'),
					font: { fontSize:smallFontSize, fontFamily: model.myFont, fontWeight: 'bold' },
					top: 15,
					right: 0,
					width: 150,
					textAlign: 'right',
					height:20 
				});
				latlngPanel.add(tmLabel);
		
	
				dataPanel.add(latlngPanel);
				
				row.add(dataPanel);
				
				myDataRowList.push(row);
			}
		}
		return myDataRowList;
	};
	
	/**
	 * This method builds the rows to display buzz rows.
	 * 
	 * @param {Object} msgEventList
	 * @param {Object} rendererFile
	 */
	Base.buildBuzzRows = function(msgEventList, rendererFile) {
		var i = 0;
		var msgEvent = null;
		var myDataRowList = [];
		var currentRow = null;
		var currentRowIndex = null;
		var username = null;
		var location = null;
		var msgTitle = null;
		
		var MAX_ROW_WIDTH = 320;
		
		if (msgEventList != null) {
			Ti.API.info('buildBuzzRows: size: ' + msgEventList.length);
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
				
				
				username = msgEvent.username;
				location = msgEvent.location;
				msgTitle = 'Posted by ' + username + ' on ' + location;
				
				//
				// create table row
				//
				var row = Ti.UI.createTableViewRow({
					selectedBackgroundColor:CSSMgr.color2,
					backgroundColor:CSSMgr.color0,
					height:0,
					width:MAX_ROW_WIDTH,
					borderColor:CSSMgr.color2,
					borderRadius: 20,
					className:'MsgEventRow' + i,
					clickName:'row',
					msgEvent:msgEvent,
					hasChild:true,
					renderer:rendererFile
				});
				Ti.API.info('buildBuzzRows: row=' + row);
				
				//
				// build message body
				//	
				Base.appendProfilePhoto(row);
				var fontSize = 14;
				if (Titanium.Platform.name == 'android') {
					fontSize = 13;
				}
				if (msgEvent.photoUrl == undefined) {
					Ti.API.info('buildBuzzRows: BASIC msg body ...');
					Base.appendMsgBody(row, fontSize);
				}
				else {
					Ti.API.info('buildBuzzRows: PHOTO msg body ...');
					Base.appendMsgBodyWithPhoto(row, fontSize);
				}
				
				var replyCounter = Ti.UI.createLabel({
					color: CSSMgr.color3,
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
				Ti.API.info('buildBuzzRows: replyCounter=' + replyCounter);
				row.add(replyCounter);
				// add row
				Ti.API.info('buildBuzzRows: Adding row=' + row);
				myDataRowList.push(row);
			}
		}
		return myDataRowList;
	};
	
	/**
	 * This method attaches a common BACK button for the app.
	 * 
	 * @param {Object} w
	 */
	Base.attachMyBACKButton = function(w) {
		var b = Titanium.UI.createButton({title:'BACK'});
		b.addEventListener('click', function() {
			Ti.API.info('Closing window --' + w);
			w.close();
		});
		w.leftNavButton = b;	
	};

	/**
	 * This methods adds an iAd to current window.
	 * 
	 * @param {Object} w
	 */	
	Base.attachiAd = function(w) {
		var iads = Ti.UI.iOS.createAdView({
    		width: 'auto',
    		height: 'auto',
    		bottom: -100,
    		borderColor: '#000000',
    		backgroundColor: '#000000'});
    	var t1 = Titanium.UI.createAnimation({bottom:0, duration:750});
    	iads.addEventListener('load', function(){
    	    iads.animate(t1);
    	});
    	w.add(iads);	
	};
	
	/**
	 * This method add a location header to the top of my window based upon a few important 
	 * attributes.
	 * 
	 * @param {Object} currentWin
	 * @param {Object} localFlag
	 * @param {Object} remoteName
	 */
	Base.buildLocationHeader = function(currentWin, localFlag, remoteName) {
		/*
		var h = Ti.UI.createView({
			height: 50,
			width: 320,
			top: -100,
			borderColor: CSSMgr.color0,
			backgroundColor: CSSMgr.color0
		});
		*/
		var h = Ti.UI.createView({
			height: 50,
			width: 320,
			top: 0,
			borderColor: CSSMgr.color0,
			backgroundColor: CSSMgr.color0
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
					color: CSSMgr.color4
				});
			}
			else {
				selectedLake = Ti.UI.createLabel({
					text: (model.getLastLocTime() == 0 ? '...' : Msgs.OUT_OF_ZONE),
					top: 15,
					left: 10,
					height: 25,
					font: {
						fontFamily: model.myFont,
						fontSize: 16,
						fontWeight: 'bold'
					},
					color: CSSMgr.color3
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
				color: CSSMgr.color4
			});
		}
		
		//
		// add items to table header
		//
		h.add(label0);
		h.add(selectedLake);
		h.add(userLabel);
		h.add(userCountLbl);
		
		/*
		var t2 = Titanium.UI.createAnimation({top:0, duration:750});
		h.animate(t2);
		*/
		currentWin.add(h);
		
		return h;
	};
	
	
	/**
	 * This method displays a simple header very similar to the location header.
	 * 
	 * @param {Object} currentWin
	 * @param {Object} myTitle
	 */
	Base.buildPlainHeader = function(currentWin, myTitle) {
		/*
		var h = Ti.UI.createView({
			height: 50,
			width: 320,
			top: -100,
			borderColor: CSSMgr.color0,
			backgroundColor: CSSMgr.color0
		});
		*/
		
		var h = Ti.UI.createView({
			height: 50,
			width: 320,
			top: 0,
			borderColor: CSSMgr.color0,
			backgroundColor: CSSMgr.color0
		});
		
		var headerLbl0 = myTitle;
		var label0 = Ti.UI.createLabel({
			text: headerLbl0,
			top: 15,
			left: 10,
			height: 20,
			font: {
				fontFamily: model.myFont,
				fontSize: 16,
				fontWeight: 'bold'
			},
			color: '#fff'
		});
	
		//
		// add items to table header
		//
		h.add(label0);
		
		/*
		var t2 = Titanium.UI.createAnimation({top:0, duration:750});
		h.animate(t2);
		*/
		currentWin.add(h);
		
		return h;
	};
	
