function RestClient() {
	var secureBaseUrl = 'https://www.zarcode4fishin.appspot.com';
	var baseUrl = 'http://mobile.lazylaker.net';
	var myMsgRestURL = baseUrl + '/resources/events/';
	var myLakeRestURL = baseUrl + '/resources/lakes/';
	var myUserRestURL = baseUrl + '/resources/users/';
    
    // 
	// create singleton instance to communicate with remote REST web service
	//
    var myClient = {
			//
			// This method posts a message by the user to a specific lake resource (or region)
			//
			postMessage : function(from, msg, fbPostFlag) {
               	Titanium.API.info("postMessage: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	alert('postMessage: onerror: Unable to connect to remote services -- ' + e.error); 
                	Titanium.API.info("some error");
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					Titanium.API.info('postMessage: onload: Entered - ' + this.responseText);
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null) {
						Titanium.API.info('postMessage: onload: SUCCESS');
						Ti.App.fireEvent('NEW_MSG_EVENT_ADDED', { newMsgEvent:jsonNodeData, origMsgEvent:msg });
					}
					else {
						alert('Server unable to complete request -- Support has been contacted.');
					}
                };

                //
                // create connection
                //
				var appContent = 'msgEvent';
				var msgUrl = '/resources/events/';
				var targetURL = secureBaseUrl + msgUrl + msg.resourceId + '/' + appContent + '?id=' + from + '&fbPostFlag=' + (fbPostFlag ? 1 : 0);
				Titanium.API.info('postMessage: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //i
				var str = JSON.stringify(msg);
                Titanium.API.info('postMessage: Posting JSON msg (msgEvent) to server ... ' + str);
                xhr.send(str);	
			},
			//
			// This method adds a comment to an original user post.
			//
			postComment : function(from, comment) {
               	Titanium.API.info("postComment: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	alert('postComment: onerror: Unable to connect to remote services -- ' + e.error); 
                	Titanium.API.info("some error");
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					Titanium.API.info('postComment: onload: Entered - ' + this.responseText);
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null) {
						Titanium.API.info('postComment: onload: SUCCESS');
						Ti.App.fireEvent('NEW_COMMENT_ADDED', { newComment:jsonNodeData });
					}
					else {
						alert('Server unable to complete request -- Support has been contacted.');
					}
                };

                //
                // create connection
                //
				var appContent = 'comment';
				var msgUrl = '/resources/events/';
				var targetURL = secureBaseUrl + msgUrl + comment.resourceId + '/' + appContent + '?id=' + from;
				Titanium.API.info('postComment: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //i
				var str = JSON.stringify(comment);
                Titanium.API.info('postComment: Posting JSON msg (comment) to server ... ' + str);
                xhr.send(str);	
			},
			//
			// This method updates display name
			//
			updateDisplayName : function(from, displayName) {
               	Titanium.API.info("updateDisplayName: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	alert('updateDisplayName: onerror: Unable to connect to remote services -- ' + e.error); 
                	Titanium.API.info("some error");
					alert('Unable to connect to remote services');
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					Titanium.API.info('updateDisplayName: onload: Entered - ' + this.responseText);
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null) {
						Titanium.API.info('updateDisplayName: onload: SUCCESS');
						Ti.App.fireEvent('UPDATED_USER', { user:jsonNodeData });
					}
					else {
						alert('Server unable to complete request -- Support has been contacted.');
					}
                };

                //
                // create connection
                //
				var appContent = 'displayName';
				var userUrl = '/resources/user/';
				var targetURL = secureBaseUrl + userUrl + from + '/' + appContent;
				Titanium.API.info('updateDisplayName: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //i
                Titanium.API.info('updateDisplayName: Posting to server ... ' + displayName);
                xhr.send(displayName);	
			},
			//
			// This method retrieves top 50 messages posted to the requested lake polygon resource
			//
			getLocalMsgEvents : function(resourceId) {
               	Titanium.API.info("getLocalMsgEvents: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	alert('getLocalMsgEvents: onerror: Unable to connect to remote services -- ' + e.error); 
                	Titanium.API.info("some error");
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					Titanium.API.info('getLocalMsgEvents: onload: Entered - [' + this.responseText + ']');
					if (this.responseText == 'null' || this.responseText == undefined) {
						Titanium.API.info('getLocalMsgEvents: onload: Returning empty set');
						Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { result:[] });
						return;
					}
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getLocalMsgEvents: onload: SUCCESS');
							Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { result: jsonNodeData });
						}
						else {
							alert('Server unable to complete request -- Support has been contacted.');
						}
					}
					else {
						alert('Server unable to complete request -- Support has been contacted.');
					}
                };

                //
                // create connection
                //
				var targetURL = myMsgRestURL + resourceId + '?lat=' + model.getUserLat() + '&lng=' + model.getUserLng();
				Titanium.API.info('getLocalMsgEvents: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getLocalMsgEvents: Trying to get msgs from server ... ');
                xhr.send();	
			},
			getRemoteMsgEvents : function(resourceId) {
               	Titanium.API.info("getRemoteMsgEvents: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	alert('getRemoteMsgEvents: onerror: Unable to connect to remote services -- ' + e.error); 
                	Titanium.API.info("some error");
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					Titanium.API.info('getRemoteMsgEvents: onload: Entered - [' + this.responseText + ']');
					if (this.responseText == 'null' || this.responseText == undefined) {
						Titanium.API.info('getRemoteMsgEvents: onload: Returning empty set');
						Ti.App.fireEvent('REMOTE_MSG_EVENTS_RECD', { result:[] });
						return;
					}
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getRemoteMsgEvents: onload: SUCCESS');
							Ti.App.fireEvent('REMOTE_MSG_EVENTS_RECD', { result: jsonNodeData });
						}
						else {
							alert('Server unable to complete request -- Support has been contacted.');
						}
					}
					else {
						alert('Server unable to complete request -- Support has been contacted.');
					}
                };

                //
                // create connection
                //
				var targetURL = myMsgRestURL + resourceId + '?lat=' + model.getUserLat() + '&lng=' + model.getUserLng();
				Titanium.API.info('getRemoteMsgEvents: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getRemoteMsgEvents: Trying to get msgs from server ... ');
                xhr.send();	
			},
			//
			// This method retrieves top 50 messages posted to the requested lake polygon resource
			//
			searchLakesByKeyword : function(keyword) {
               	Titanium.API.info("searchLakesByKeyword: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	alert('searchLakesByKeyword: onerror: Unable to connect to remote services -- ' + e.error); 
                	Titanium.API.info("some error");
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					Titanium.API.info('searchLakesByKeyword: onload: Entered - [' + this.responseText + ']');
					if (this.responseText == 'null' || this.responseText == undefined) {
						Titanium.API.info('searchLakesByKeyword: onload: Returning empty set');
						Ti.App.fireEvent('SEARCH_RESULTS_RECD', { result:[] });
						return;
					}
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('searchLakesByKeyword: onload: SUCCESS');
							Ti.App.fireEvent('SEARCH_RESULTS_RECD', { result: jsonNodeData });
						}
						else {
							alert('Server unable to complete request -- Support has been contacted.');
						}
					}
					else {
						alert('Server unable to complete request -- Support has been contacted.');
					}
                };

                //
                // create connection
                //
				var targetURL = myLakeRestURL + 'search?keyword=' + keyword;
				Titanium.API.info('searchLakesByKeyword: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('searchLakesByKeyword: Trying to get msgs from server ... ');
                xhr.send();	
			},
			//
			// This method determines if the user's location is inside a pre-defined lake polygon	
			//
			getBestResourceMatch : function(llId, lat, lng) {
               	Titanium.API.info("getBestResourceMatch: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	alert('getBestResourceMatch: onerror: Unable to connect to remote services -- ' + e.error); 
                	Titanium.API.info("some error");
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					Titanium.API.info('getBestResourceMatch: onload: Entered - [' + this.responseText + ']');
					if (this.responseText == 'null' || this.responseText == undefined) {
						Ti.App.fireEvent('BEST_RESOURCE_MATCH_RECD', { MsgEvent:[] });
						return;
					}
					if (this.responseText == 'null' || this.responseText == undefined) {
						Titanium.API.info('getLocalMsgEvents: onload: Returning empty set');
						Ti.App.fireEvent('BEST_RESOURCE_MATCH_RECD', { MsgEvent:[] });
						return;
					}
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getBestResourceMatch: onload: SUCCESS');
							Ti.App.fireEvent('BEST_RESOURCE_MATCH_RECD', jsonNodeData);
						}
						else {
							alert('Server unable to complete request -- Support has been contacted.');
						}
					}
					else {
						alert('Server unable to complete request -- Support has been contacted.');
					}
                };

                //
                // create connection
                //
				var targetURL = null;
				if (llId == 'ABC123') {
					var deviceId = Titanium.Network.encodeURIComponent(model.getDeviceId());
					targetURL = myUserRestURL + "ping/" + llId + '?lat=' + lat + '&lng=' + lng + '&devId=' + deviceId;
				}
				else {
					targetURL = myUserRestURL + "ping/" + llId + '?lat=' + lat + '&lng=' + lng;
				}
				Titanium.API.info('getBestResourceMatch: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getBestResourceMatch: Trying to determine if the user is inside of the lake polygon');
                xhr.send();	
			}
    };
    return myClient;
};
