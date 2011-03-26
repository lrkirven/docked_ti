
	var Tools = {}; // Tools namespace
	
	/**
	 * Trims a string.
	 * 
	 * @param {Object} stringToTrim
	 */
	Tools.trim = function(stringToTrim) {
		return stringToTrim.replace(/^\s+|\s+$/g,"");
	};
	
	/**
	 * Converts to radian.
	 * 
	 * @param {Object} val
	 */
	Tools.toRad = function(val) {
		var res = val * Math.PI / 180;	
		return res;
	};
	
	/**
	 * Converts to degrees.
	 * 
	 * @param {Object} val
	 */
	Tools.toDeg = function(val) {
		var res = val * 180 / Math.PI;	
		return res;
	};
	
	Tools.toPrecisionFixed = function(val, precision) {
		var n;
	    if (isNaN(val)) {
			return 'NaN';
		}
	    var numb = val < 0 ? -val : val;  // can't take log of -ve number...
	    var sign = val < 0 ? '-' : '';
	    
	    if (numb == 0) { 
			n = '0.'; 
			while (precision--) {
				n += '0';
			}
			 return n; 
		}  
		
	    // no of digits before decimal
	    var scale = Math.ceil( Math.log(numb) * Math.LOG10E );
		
	    n = String(Math.round(numb * Math.pow(10, precision-scale)));
		
		// add trailing zeros & insert decimal as required
	    if (scale > 0) { 
	      l = scale - n.length;
	      while (l-- > 0) {
		  	n = n + '0';
		  }
	      if (scale < n.length) {
		  	n = n.slice(0, scale) + '.' + n.slice(scale);
		  }
	    }           
		// prefix decimal and leading zeros if required
		else {
	      while (scale++ < 0) {
		  	n = '0' + n;
		  }
	      n = '0.' + n;
	    }
		if (n.length > 6) {
			n = n.slice(0, 6);	
		}
	    return sign + n;
  	};
	
	Tools.round = function(num, dec) {
		var val = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
		return val;
	};

	/**
	 * Calculate the distance between 2 points.
	 * 
	 * @param {Object} lat1
	 * @param {Object} lng1
	 * @param {Object} lat2
	 * @param {Object} lng2
	 */	
	Tools.distanceFromAB = function(lat1, lng1, lat2, lng2) {
		var precision = 4;
		var R = 6371; // km
		var dLat = Tools.toRad((lat2-lat1));
		var dLon =  Tools.toRad((lng2-lng1)); 
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(Tools.toRad(lat1)) * Math.cos(Tools.toRad(lat2)) *  Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c;
		var dInMiles = (d * 0.621371192);
		/*
		 * rounding distance to 2 decimals
		 */
		var dec = 2;
		var dInMiles = Math.round(dInMiles*Math.pow(10,dec))/Math.pow(10,dec);
		return dInMiles;
	};
	
	/**
	 * Calculates the bearing.
	 * 
	 * @param {Object} lat1
	 * @param {Object} lng1
	 * @param {Object} lat2
	 * @param {Object} lng2
	 */
	Tools.calcBearing = function(lat1, lng1, lat2, lng2){
		var lat1Rad = Tools.toRad(lat1);
		var lat2Rad = Tools.toRad(lat2);
		var dLon = Tools.toRad((lng2 - lng1));
		var y = Math.sin(dLon) * Math.cos(lat2Rad);
		var x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
		var brng = Math.atan2(y, x);
		
		var res = (Tools.toDeg(brng) + 360) % 360;
		return Tools.toPrecisionFixed(res, 4);
	};
	
	/**
	 * Calcuate the distance and bearing.
	 * 
	 * @param {Object} lat1
	 * @param {Object} lng1
	 * @param {Object} lat2
	 * @param {Object} lng2
	 */
	Tools.calcDistBear = function(lat1, lng1, lat2, lng2) {
		var dist = Tools.distanceFromAB(lat1, lng1, lat2, lng2);
		var brng = Tools.calcBearing(lat1, lng1, lat2, lng2);
		var distBearVal = dist + ' mi away, bearing ' + brng;
		return distBearVal;	
	};
	
	/**
	 * Returns a formatted string to display distance between 2 points.
	 * 
	 * @param {Object} lat1
	 * @param {Object} lng1
	 * @param {Object} lat2
	 * @param {Object} lng2
	 */
	Tools.calcDist = function(lat1, lng1, lat2, lng2) {
		var dist = Tools.distanceFromAB(lat1, lng1, lat2, lng2);
		var distVal = dist + ' mi away';
		return distVal;	
	};
	
	/**
	 * Returns distance and bearing between 2 point in an object.
	 * 
	 * @param {Object} lat1
	 * @param {Object} lng1
	 * @param {Object} lat2
	 * @param {Object} lng2
	 */
	Tools.calcDistBearObject = function(lat1, lng1, lat2, lng2) {
		var dist = Tools.distanceFromAB(lat1, lng1, lat2, lng2);
		var brng = Tools.calcBearing(lat1, lng1, lat2, lng2);
		return { distance:dist, bearing:brng };
	};
	
	/**
	 * Popups generic error message to user.
	 * 
	 * @param {Object} title
	 * @param {Object} msg
	 */
	Tools.reportMsg = function(title, msg) {
		var alertDialog = Titanium.UI.createAlertDialog({
			message: msg,
			title: title,
			buttonNames: ['OK']
		});
		alertDialog.show();
	};
	
	Tools.test4NotFound = function(response) {
		var flag = false;
		var pattern = /.*404 NOT_FOUND.*/g;
		if (pattern.test(response)) {
			flag = true;
		}
		return flag;
	};
	
	Tools.test4ServerDown = function(response) {
		var flag = false;
		var pattern = /.*500 Server Error.*/g;
		if (pattern.test(response)) {
			flag = true;
		}
		return flag;
	};
	
	
