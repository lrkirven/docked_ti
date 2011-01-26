
	var Tools = {}; // Tools namespace
	
	Tools.trim = function(stringToTrim) {
		return stringToTrim.replace(/^\s+|\s+$/g,"");
	};
	
	Tools.distanceFromAB = function(lat1, lng1, lat2, lng2) {
		var R = 6371; // km
		var dLat = (lat2-lat1).toRad();
		var dLon = (lng2-lng1).toRad(); 
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *  Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c;
		var dInMiles = (d/0.621371192);
		return dInMiles;
	};
	
	Tools.reportMsg = function(title, msg) {
		var alertDialog = Titanium.UI.createAlertDialog({
			message: msg,
			title: title,
			buttonNames: ['OK']
		});
		alertDialog.show();
	};
