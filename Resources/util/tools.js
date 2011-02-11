
	var Tools = {}; // Tools namespace
	
	Tools.trim = function(stringToTrim) {
		return stringToTrim.replace(/^\s+|\s+$/g,"");
	};
	
	Tools.toRad = function(val) {
		var res = val * Math.PI / 180;	
		return res;
	};
	
	Tools.toDeg = function(val) {
		var res = val * 180 / Math.PI;	
		return res;
	};
	
	Tools.toPrecisionFixed = function(val, precision) {
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
			 return n 
		}  // can't take log of zero
		
	    // no of digits before decimal
	    var scale = Math.ceil( Math.log(numb) * Math.LOG10E );
		
	    var n = String(Math.round(numb * Math.pow(10, precision-scale)));
		
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
	    return sign + n;
  	}
	
	Tools.distanceFromAB = function(lat1, lng1, lat2, lng2) {
		var precision = 4;
		var R = 6371; // km
		var dLat = Tools.toRad((lat2-lat1));
		var dLon =  Tools.toRad((lng2-lng1)); 
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(Tools.toRad(lat1)) * Math.cos(Tools.toRad(lat2)) *  Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c;
		var dInMiles = (d * 0.621371192);
		return Tools.toPrecisionFixed(dInMiles, 4);
	};
	
	Tools.calcBearing = function(lat1, lng1, lat2, lng2){
		var lat1 = Tools.toRad(lat1);
		var lat2 = Tools.toRad(lat2);
		var dLon = Tools.toRad((lng2 - lng1));
		var y = Math.sin(dLon) * Math.cos(lat2);
		var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
		var brng = Math.atan2(y, x);
		
		var res = (Tools.toDeg(brng) + 360) % 360;
		return Tools.toPrecisionFixed(res, 4);
	}
	
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
	
	
