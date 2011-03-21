
function FacebookClient() {
	var fbBaseUrl = 'https://graph.facebook.com';
	var fbWallUrl = 'https://graph.facebook.com/me/feed'
	var fbDockedWallUrl = 'https://graph.facebook.com/195955030426577/feed'
	var fbCurrentUserUrl = 'https://graph.facebook.com/me';
	var lastBucket = null;
	var picasaPassword = null;
	var fbAccessToken = null;
	
	var httpCodes = { // Http namespace
		OK:200,
		CREATED:201,
		ACCEPTED:202,
		NO_CONTENT:204,
		RESET_CONTENT:205,
		BAD_REQUEST:400,
		UNAUTHORIZED:401,
		INTERNAL_ERROR:500
	};
	
	var myClient = {
		setAccessToken :  function(token) {
			fbAccessToken = token;	
		},
		getAccessToken :  function(token) {
			return fbAccessToken;	
		},
		publishStream : function(postData) {
			var uploadingPhoto = false;
			var now = new Date();
			
			if (!Titanium.Network.online) {
				Ti.App.fireEvent('FB_PUBLISH_STREAM_RESP', { status:69,
					errorMsg: Msgs.NO_DATA_SERVICE
				});
			}
			
			var xhr = Ti.Network.createHTTPClient();
            xhr.setTimeout(20000);
			
			//
            // error
            //
            xhr.onerror = function(e) {
				Ti.App.fireEvent('FB_PUBLISH_STREAM_RESP', { status:69,
					errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
				});
             }; 
			 
			 /*
			  * Adding Faceboock Graph API here
			  */
			  xhr.onload = function() {
				if (this.status >= httpCodes.BAD_REQUEST) {
					handleErrorResp(this.status, 'FB_PUBLISH_STREAM_RESP');	
					return;
				}
				if (Tools.test4NotFound(this.responseText)) {
					Ti.App.fireEvent('FB_PUBLISH_STREAM_RESP', { status:89,
						errorMsg: 'publishStream: Unable complete request at this time -- Apologize for the service failure.'	
					});
					return;
				}
				Titanium.API.info('publishStream: onload: Entered - [' + this.responseText + ']');
				if (this.responseText == 'null' || this.responseText == undefined) {
					Titanium.API.info('publishStream: onload: Returning empty set');
					Ti.App.fireEvent('FB_PUBLISH_STREAM_RESP', { result:[], status:0 });
					return;
				}
				if (this.responseText != null) {
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null) {
						Titanium.API.info('publishStream: onload: SUCCESS');
						Ti.App.fireEvent('FB_PUBLISH_STREAM_RESP', { result:jsonNodeData, status:0 });
					}
					else {
						Ti.App.fireEvent('FB_PUBLISH_STREAM_RESP', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
				}
				else {
					Ti.App.fireEvent('FB_PUBLISH_STREAM_RESP', { status:99,
						errorMsg: 'Unable to complete request at this time'	
					});
				}
             };
				
			//
            // create connection
            //
            xhr.open('POST', fbWallUrl);
			if (uploadingPhoto) {
				xhr.setRequestHeader('enctype', 'multipart/form-data');
			}
            //
            // send HTTP request
            //
            Titanium.API.info('publishStream: publish msg to fb ... ');
            xhr.send(postData);
			
		},
		publishStreamToDockedPage : function(postData) {
			var uploadingPhoto = false;
			var now = new Date();
			
			if (!Titanium.Network.online) {
				Ti.App.fireEvent('DOCKED_FB_PUBLISH_STREAM_RESP', { status:69,
					errorMsg: Msgs.NO_DATA_SERVICE
				});
			}
			
			var xhr = Ti.Network.createHTTPClient();
            xhr.setTimeout(20000);
			
			//
            // error
            //
            xhr.onerror = function(e) {
				Ti.App.fireEvent('DOCKED_FB_PUBLISH_STREAM_RESP', { status:69,
					errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
				});
             }; 
			 
			 /*
			  * Adding Faceboock Graph API here
			  */
			  xhr.onload = function() {
				if (this.status >= httpCodes.BAD_REQUEST) {
					handleErrorResp(this.status, 'DOCKED_FB_PUBLISH_STREAM_RESP');	
					return;
				}
				if (Tools.test4NotFound(this.responseText)) {
					Ti.App.fireEvent('DOCKED_FB_PUBLISH_STREAM_RESP', { status:89,
						errorMsg: 'publishStreamToDockedPage: Unable complete request at this time -- Apologize for the service failure.'	
					});
					return;
				}
				Titanium.API.info('publishStreamToDockedPage: onload: Entered - [' + this.responseText + ']');
				if (this.responseText == 'null' || this.responseText == undefined) {
					Titanium.API.info('publishStreamToDockedPage: onload: Returning empty set');
					Ti.App.fireEvent('DOCKED_FB_PUBLISH_STREAM_RESP', { result:[], status:0 });
					return;
				}
				if (this.responseText != null) {
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null) {
						Titanium.API.info('publishStreamToDockedPage: onload: SUCCESS');
						Ti.App.fireEvent('DOCKED_FB_PUBLISH_STREAM_RESP', { result:jsonNodeData, status:0 });
					}
					else {
						Ti.App.fireEvent('DOCKED_FB_PUBLISH_STREAM_RESP', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
				}
				else {
					Ti.App.fireEvent('DOCKED_FB_PUBLISH_STREAM_RESP', { status:99,
						errorMsg: 'Unable to complete request at this time'	
					});
				}
             };
				
			//
            // create connection
            //
            xhr.open('POST', fbWallUrl);
            //
            // send HTTP request
            //
            Titanium.API.info('publishStreamToDockedPage: publish msg to Docked fb ... ');
            xhr.send(postData);
		},
		getUserProfile : function(tag) {
			
			if (!Titanium.Network.online) {
				Ti.App.fireEvent('FB_USER_PROFILE_RECD', { status:69,
					errorMsg: Msgs.NO_DATA_SERVICE
				});
			}
				
			var xhr = Ti.Network.createHTTPClient();
            xhr.setTimeout(90000);
				
            // 
            // error
            //
            xhr.onerror = function(e) {
				Ti.App.fireEvent('FB_USER_PROFILE_RECD', { status:69,
					errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
				});
        	}; 
			
			xhr.onload = function() {
				if (this.status >= httpCodes.BAD_REQUEST) {
					handleErrorResp(this.status, 'FB_USER_PROFILE_RECD');	
					return;
				}
				if (Tools.test4NotFound(this.responseText)) {
					Ti.App.fireEvent('FB_USER_PROFILE_RECD', { status:89,
						errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
					});
					return;
				}
				Titanium.API.info('getUserProfile: onload: Entered - [' + this.responseText + ']');
				if (this.responseText == 'null' || this.responseText == undefined) {
					Titanium.API.info('getUserProfile: onload: Returning empty set');
					Ti.App.fireEvent('FB_USER_PROFILE_RECD', { result:[], status:0 });
					return;
				}
				if (this.responseText != null) {
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null) {
						Titanium.API.info('getUserProfile: onload: SUCCESS');
						Ti.App.fireEvent('FB_USER_PROFILE_RECD', { result:jsonNodeData, fbBaseUrl:fbBaseUrl, status:0, tag:tag });
					}
					else {
						Ti.App.fireEvent('FB_USER_PROFILE_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
				}
				else {
					Ti.App.fireEvent('FB_USER_PROFILE_RECD', { status:99,
						errorMsg: 'Unable to complete request at this time'	
					});
				}
			};
				
			var targetURL = fbCurrentUserUrl; 
			targetURL = targetURL + '?access_token=' + fbAccessToken;
			Titanium.API.info('getUserProfile: REST URL: ' + targetURL);
            xhr.open('GET', targetURL);
			xhr.setRequestHeader('Accept', 'application/json');
            //
            // send HTTP request
            //
            Titanium.API.info('getUserProfile: Getting fb user profile.');
            xhr.send();	
		},
		/**
		 * Gets the user data based upon incoming connection data (i.e picture)
		 * @param {Object} connection
		 */
		getUserData : function(connection) {
			
			if (!Titanium.Network.online) {
				Ti.App.fireEvent('FB_USER_DATA_RECD', { status:69,
					errorMsg: Msgs.NO_DATA_SERVICE
				});
			}
				
			var xhr = Ti.Network.createHTTPClient();
            xhr.setTimeout(90000);
				
            // 
            // error
            //
            xhr.onerror = function(e) {
				Ti.App.fireEvent('FB_USER_DATA_RECD', { status:69,
					errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
				});
        	}; 
			
			xhr.onload = function() {
				if (this.status >= httpCodes.BAD_REQUEST) {
					handleErrorResp(this.status, 'FB_USER_DATA_RECD');	
					return;
				}
				if (Tools.test4NotFound(this.responseText)) {
					Ti.App.fireEvent('FB_USER_DATA_RECD', { status:89,
						errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
					});
					return;
				}
				Titanium.API.info('getUserData: onload: Entered - [' + this.responseText + ']');
				Titanium.API.info('getUserData: onload: Entered - [' + this.responseXML + ']');
				if (this.responseText == 'null' || this.responseText == undefined) {
					Titanium.API.info('getUserData: onload: Returning empty set');
					Ti.App.fireEvent('FB_USER_DATA_RECD', { result:[], status:0 });
					return;
				}
				if (this.responseText != null) {
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null) {
						Titanium.API.info('getUserData: onload: SUCCESS');
						Ti.App.fireEvent('FB_USER_DATA_RECD', { result:jsonNodeData, status:0, connection:connection });
					}
					else {
						Ti.App.fireEvent('FB_USER_DATA_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
				}
				else {
					Ti.App.fireEvent('FB_USER_DATA_RECD', { status:99,
						errorMsg: 'Unable to complete request at this time'	
					});
				}
			};
				
			var targetURL = fbCurrentUserUrl + '/' + connection; 
			targetURL = targetURL + '?access_token=' + fbAccessToken;
			Titanium.API.info('getUserData: REST URL: ' + targetURL);
            xhr.open('GET', targetURL);
			// xhr.setRequestHeader('Accept', 'application/json');
            //
            // send HTTP request
            //
            Titanium.API.info('getUserData: Getting fb user data ... ' + connection);
            xhr.send();	
		}
		
	};
	
	return myClient;
};
