
function WebPurityClient() {
	
	var webPurityUrl = 'http://api1.webpurify.com/services/rest/?api_key=';
	var apiKey = '0c27007ca617fcfa2858805a018a3758';
	var REPLACE_METHOD = 'webpurify.live.replace';
	var REPLACE_SYMBOL = '*';
	
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
	
	function handleErrorResp(statusCode, eventName) {
       		Titanium.API.warn('handleErrorResp(): Found statusCode -- ' + statusCode);
		if (statusCode == httpCodes.BAD_REQUEST) {
			Ti.App.fireEvent(eventName, { status:69,
				errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'
			});
		}
		else if (statusCode == httpCodes.UNAUTHORIZED) {
			Ti.App.fireEvent(eventName, { status:69,
				errorMsg: 'Your user account was not authorized to perform action -- Please contact support for assistance.'
			});
		}
		else if (statusCode == httpCodes.INTERNAL_ERROR) {
			Ti.App.fireEvent(eventName, { status:69,
				errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'
			});
		}
		else {
			Ti.App.fireEvent(eventName, { status:69,
				errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'
			});
		}
	};
	
	var myClient = {
		setApiKey :  function(k) {
			apiKey = k;	
		},
		getApiKey :  function() {
			return apiKey;	
		},
		filterText : function(messageData) {
			if (!Titanium.Network.online) {
				Ti.App.fireEvent('WP_FILTERED_TEXT', { status:69,
					errorMsg: Msgs.NO_DATA_SERVICE
				});
			}
			var xhr = Ti.Network.createHTTPClient();
            xhr.setTimeout(90000);
            // 
            // error
            //
            xhr.onerror = function(e) {
				Ti.App.fireEvent('WP_FILTERED_TEXT', { status:69,
					errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
				});
        	}; 
			xhr.onload = function() {
				if (this.status >= httpCodes.BAD_REQUEST) {
					handleErrorResp(this.status, 'WP_FILTERED_TEXT');	
					return;
				}
				if (Tools.test4NotFound(this.responseText)) {
					Ti.App.fireEvent('WP_FILTERED_TEXT', { status:89,
						errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
					});
					return;
				}
				Titanium.API.info('filterText: onload: Entered - [' + this.responseText + ']');
				if (this.responseText == 'null' || this.responseText == undefined) {
					Titanium.API.info('getUserProfile: onload: Returning empty set');
					Ti.App.fireEvent('WP_FILTERED_TEXT', { result:[], status:0 });
					return;
				}
				if (this.responseText != null) {
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null) {
						Titanium.API.info('filterText: onload: SUCCESS');
						Ti.App.fireEvent('WP_FILTERED_TEXT', { result:jsonNodeData, status:0 });
					}
					else {
						Ti.App.fireEvent('WP_FILTERED_TEXT', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
				}
				else {
					Ti.App.fireEvent('WP_FILTERED_TEXT', { status:99,
						errorMsg: 'Unable to complete request at this time'	
					});
				}
			};
			
			var myText = Titanium.Network.encodeURIComponent(messageData);
			var targetURL = webPurityUrl + apiKey;
			targetURL = targetURL + '&method=' + REPLACE_METHOD + '&replacesymbol=' + REPLACE_SYMBOL + '&text=' + myText + '&format=json';
			Titanium.API.info('filterText: REST URL: ' + targetURL);
            xhr.open('GET', targetURL);
			xhr.setRequestHeader('Accept', 'application/json');
            //
            // send HTTP request
            //
            Titanium.API.info('filterText: ');
            xhr.send();	
		}
	};
	
	return myClient;
};
