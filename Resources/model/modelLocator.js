function ModelLocator() {
	var secureBaseUrl = 'https://dockedmobile.appspot.com';
	var baseUrl = 'http://dockedmobile.appspot.com';
	// var secureBaseUrl = 'https://zarcode4fishin.appspot.com';
	// var baseUrl = 'http://zarcode4fishin.appspot.com';
	// var baseUrl = 'http://mobile.lazylaker.net';
	var myRestURL = baseUrl + '/resources/events/add/123';
	var currentLake = null;
	var currentUser = null;
    var responseMap = {};
	var reportTable = {};
	var centerLat = 0;
	var centerLng = 0;
	var lastBucket = null;
	var pendingMsgEvent = null;
	var pendingRawImage = null;
	var userLat = 0;
	var userLng = 0;
	var actualLat = 0;
	var actualLng = 0;
	var lastMove = 0;
	var myFont = 'Verdana';	
	var fbName = null;
	var fbStatus = null;
	var fbProfileUrl = null;
	var useFbProfilePic = false;
	// var fbAPIKey = '8851fedb7bd7eef10c642cdaffa7faa9';
	var fbAPIKey = null;
	var wpAPIKey = null;
	// var fbSecret = '4a4cbd0adac0c8ead93f848f93083ad6';
	var fbSecret = null;
	var fbAccessToken = null;
	var fbAccessTokenTM = 0;
	var picasaUser = null;
	var picasaPassword = null;
	var logoutUrl = null;
	var pw1 = "the harder you work; the luckier you get";
	var pw2 = null;
	var pw3 = "dont worry be happy 137103";
	var pw4 = 'ABCDEF7891011121314';
	var anonymousUser = 'ABC123';
	var deviceId = null;
	var lastPing = 0;
	var lastLocTime = 0;
	var sync2Fb = false;
	
    this.singletonInstance = null;

    var getInstance = function() {
        if (!this.singletonInstance) { 
            this.singletonInstance = createInstance();
        }
        return this.singletonInstance;
    };

	//
    // Create an instance of the Model
	//
    var createInstance = function() {
		//
        // Here, you return all public methods and variables
		//
        return {
			getAppName : function() {
				return 'Docked';
			},
			setSync2Fb : function (d) {
				sync2Fb = d;	
			},
			getSync2Fb : function() {
				return sync2Fb;
			},
			isFbAccessTokenValid : function() {
				if (fbAccessToken == null) {
					return false;
				}	
				else {
					var now = new Date();
					var diff = now.getTime() - fbAccessTokenTM;
					diff = (((diff/1000)/60)/60);
					// over 2 hours
					if (diff >= 2) {
						return false;
					}
					else {
						return true;
					}
				}
			},
			setFbAccessToken : function (token) {
				fbAccessToken = token;	
				var now = new Date();
				fbAccessTokenTM = now.getTime();
			},
			getFbAccessToken : function() {
				return fbAccessToken;
			},
			setReportTable : function (t) {
				reportTable = t;	
			},
			getReportTable : function() {
				return reportTable;
			},
			setDeviceId : function (d) {
				deviceId = d;	
			},
			getDeviceId : function() {
				return deviceId;
			},
			getSecureBaseUrl : function() {
				return secureBaseUrl;
			},
			getBaseUrl : function() {
				return baseUrl;
			},
			getAnonymousUser : function() {
				return anonymousUser;
			},
			getPW1 : function() {
				return pw1;
			},
			setPW2 : function (p) {
				pw2 = p;	
			},
			getPW2 : function() {
				return pw2;
			},
			setPW3 : function (p) {
				pw3 = p;	
			},
			getPW3 : function() {
				return pw3;
			},
			getPW4 : function() {
				return pw4;
			},
			getLogoutUrl : function() {
				return logoutUrl;
			},
			setLogoutUrl : function (url) {
				logoutUrl = url;	
			},
			getFBStatus : function() {
				return fbStatus;
			},
			setFBStatus : function (status) {
				fbStatus = status;	
			},
			getPicasaUser : function() {
				return picasaUser;
			},
			setPicasaUser : function (u) {
				picasaUser = u;	
			},
			getPicasaPassword : function() {
				return picasaPassword;
			},
			setPicasaPassword : function (p) {
				picasaPassword = p;	
			},
			getUseFBProfilePic : function() {
				return useFbProfilePic;
			},
			setUseFBProfilePic : function (flag) {
				useFbProfilePic = flag;	
			},
			getFBProfileUrl : function() {
				return fbProfileUrl;
			},
			setFBProfileUrl : function (url) {
				fbProfileUrl = url;	
			},
			getLakeDisplay : function() {
				if (targetLake != undefined) {
					return targetLake.name + ', ' + targetLake.state;
				}
				return '[NOT FOUND]';
			},
			setFBAPIKey : function (k) {
				fbAPIKey = k;	
			},
			getFBAPIKey : function() {
				return fbAPIKey;
			},
			setFBSecret : function (s) {
				fbSecret = s;	
			},
			getFBSecret : function() {
				return fbSecret;
			},
			setWPApiKey : function (k) {
				wpAPIKey = k;	
			},
			getWPApiKey : function() {
				return wpAPIKey;
			},
			setCurrentLake : function (obj) {
				currentLake = obj;	
			},
			getCurrentLake : function() {
				return currentLake;
			},
			setCurrentUser : function (u) {
				currentUser = u;	
			},
			getCurrentUser : function() {
				return currentUser;
			},
			getMapCenter : function() {
				return { latitude:centerLat, longitude:centerLng,  latitudeDelta:0.5, longitudeDelta:0.5 };
			},
			setMapCenter : function(lat, lng) {
				centerLat = lat;
				centerLng = lng;	
			},
			isUserLocationSame : function(lat, lng) {
				if (lat != userLat) {
					return false;
				}	
				if (lng != userLng) {
					return false;
				}
				return true;	
			},
			setLastPing : function(tm) {
				lastPing = tm;	
			},
			getLastPing : function() {
				return lastPing;
			},
			setUserLat : function(lat) {
				userLat = lat;	
			},
			getUserLat : function() {
				return userLat;
			},
			setUserLng : function(lng) {
				userLng	= lng;	
			},
			getUserLng : function() {
				return userLng;
			},
			setActualLat : function(lat) {
				actualLat = lat;	
			},
			getActualLat : function() {
				return actualLat;
			},
			setActualLng : function(lng) {
				actualLng	= lng;	
			},
			getActualLng : function() {
				return actualLng;
			},
			setLastLocTime : function(last) {
				lastLocTime = last;	
			},
			getLastLocTime : function() {
				return lastLocTime;
			},
			setLastBucket : function(last) {
				lastBucket = last;	
			},
			getLastBucket : function() {
				return lastBucket;
			},
			setPendingMsgEvent : function(msgEvent) {
				pendingMsgEvent = msgEvent;	
			},
			getPendingMsgEvent : function() {
				return pendingMsgEvent;
			},
			setPendingRawImage : function(image) {
				pendingRawImage = image;	
			},
			getPendingRawImage : function() {
				return pendingRawImage;
			}
        };
    };

    return getInstance();
}