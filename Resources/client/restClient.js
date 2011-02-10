function RestClient(){
	var secureBaseUrl = 'https://www.zarcode4fishin.appspot.com';
	var baseUrl = 'http://mobile.lazylaker.net';
	var myMsgRestURL = baseUrl + '/resources/buzz/';
	var myLakeRestURL = baseUrl + '/resources/lakes/';
	var myUserRestURL = baseUrl + '/resources/users/';
	var myReportRestURL = baseUrl + '/resources/reports/';
	var myHotSpotRestURL = baseUrl + '/resources/hotspots/';
	
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
    
    // 
	// create singleton instance to communicate with remote REST web service
	//
    var myClient = {
			/*	
			 * This method posts a message by the user to a specific lake resource (or region)
			 */	
			postMessage : function(llId, msg, addToMyHotSpots) {
               	Titanium.API.info("postMessage: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	Titanium.API.info("some error");
					Ti.App.fireEvent('NEW_MSG_EVENT_ADDED', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'NEW_MSG_EVENT_ADDED');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('NEW_MSG_EVENT_ADDED', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('postMessage: onload: Entered - ' + this.responseText);
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('postMessage: onload: SUCCESS');
							Ti.App.fireEvent('NEW_MSG_EVENT_ADDED', { newMsgEvent: jsonNodeData, origMsgEvent: msg, status:0 });
						}
						else {
							Ti.App.fireEvent('NEW_MSG_EVENT_ADDED', 
								{ status:99, errorMsg:'Remote services unable to complete request -- Support has been contacted.' });
						}
					}
					else {
						Ti.App.fireEvent('NEW_MSG_EVENT_ADDED', 
							{ status:99, errorMsg:'Remote services unable to complete request -- Support has been contacted.' });
					}
                };

                //
                // create connection
                //
				var appContent = 'newMsg';
				var msgUrl = '/resources/buzz/';
				var targetURL = secureBaseUrl + msgUrl + msg.resourceId + '/' + appContent + "?addToMyHotSpots=" + addToMyHotSpots ;
				Titanium.API.info('postMessage: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
				var modId = Titanium.Network.encodeURIComponent(llId);
				msg.llId = modId;
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
                	Titanium.API.info("some error");
					Ti.App.fireEvent('NEW_COMMENT_ADDED', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'NEW_COMMENT_ADDED');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('NEW_COMMENT_ADDED', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('postComment: onload: Entered - ' + this.responseText);
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null) {
						Titanium.API.info('postComment: onload: SUCCESS');
						Ti.App.fireEvent('NEW_COMMENT_ADDED', { newComment:jsonNodeData, status:0 });
					}
					else {
						Ti.App.fireEvent('NEW_COMMENT_ADDED', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var appContent = 'comment';
				var msgUrl = '/resources/buzz/';
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
			addHotSpot : function(userToken, hotSpot) {
               	Titanium.API.info("addHotSpot: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	Titanium.API.info("some error");
					Ti.App.fireEvent('NEW_HOTSPOT_ADDED', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'NEW_HOTSPOT_ADDED');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('NEW_HOTSPOT_ADDED', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('addHotSpot: onload: Entered - ' + this.responseText);
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('addHotSpot: onload: SUCCESS');
							Ti.App.fireEvent('NEW_HOTSPOT_ADDED', { newMsgEvent: jsonNodeData, origMsgEvent: msg, status:0 });
						}
						else {
							Ti.App.fireEvent('NEW_HOTSPOT_ADDED', 
								{ status:99, errorMsg:'Remote services unable to complete request -- Support has been contacted.' });
						}
					}
					else {
						Ti.App.fireEvent('NEW_HOTSPOT_ADDED', 
							{ status:99, errorMsg:'Remote services unable to complete request -- Support has been contacted.' });
					}
                };

                //
                // create connection
                //
				var targetURL =  myHotSpotRestURL + msg.resourceId + '?userToken' + userToken ;
				Titanium.API.info('addHotSpot: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
				var str = JSON.stringify(hotSpot);
                Titanium.API.info('postMessage: Posting JSON msg (hotSpot) to server ... ' + str);
                xhr.send(str);	
			},
			/*
			 * Register user with an user account
			 */
			registerUser : function(emailAddr, displayName, registerSecret) {
               	Titanium.API.info("registerUser: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	Titanium.API.info("some error");
					Ti.App.fireEvent('USER_REGISTERED', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'USER_REGISTERED');	
						return;
					}
					if (this.responseText == null) {
						Ti.App.fireEvent('USER_REGISTERED', { status:77,
							errorMsg: 'Unable complete registration at this time -- Apologize for the service failure.'	
						});
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('USER_REGISTERED', { status:89,
							errorMsg: 'Unable complete registration at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('registerUser: onload: Entered - ' + this.responseText);
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null) {
						Titanium.API.info('registerUser: onload: SUCCESS ---> ' + jsonNodeData);
						Ti.App.fireEvent('USER_REGISTERED', { token:jsonNodeData, status:jsonNodeData.status });
					}
					else {
						Ti.App.fireEvent('USER_REGISTERED', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var userUrl = '/resources/users/register';
				var targetURL = secureBaseUrl + userUrl;
				Titanium.API.info('registerUser: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('registerUser: Posting to server ... ' + displayName);
				var email = Titanium.Network.encodeURIComponent(emailAddr);
				var name = Titanium.Network.encodeURIComponent(displayName);
				var secret = Titanium.Network.encodeURIComponent(registerSecret); 
				var registerToken = { emailAddr:email, displayName:name, registerSecret:secret };
				var str = JSON.stringify(registerToken);
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
                	Titanium.API.info("some error");
					Ti.App.fireEvent('UPDATED_DISPLAY_NAME', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'UPDATED_DISPLAY_NAME');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('UPDATED_DISPLAY_NAME', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('updateDisplayName: onload: Entered - ' + this.responseText);
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null && jsonNodeData.result > 0) {
						Titanium.API.info('updateDisplayName: onload: SUCCESS');
						Ti.App.fireEvent('UPDATED_DISPLAY_NAME', { displayName:jsonNodeData.value, status:0 });
					}
					else {
						Ti.App.fireEvent('UPDATED_DISPLAY_NAME', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var userUrl = '/resources/users/update';
				var targetURL = secureBaseUrl + userUrl;
				Titanium.API.info('updateDisplayName: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('updateDisplayName: Posting to server ... ' + displayName);
				var modId = Titanium.Network.encodeURIComponent(from);
				var modName = Titanium.Network.encodeURIComponent(displayName);
				var updateAction = { llId:modId, object:'User', field:'displayName', value: modName, result: 0 };
				var str = JSON.stringify(updateAction);
                xhr.send(str);	
			},
			//
			// This method updates display name
			//
			updateProfileUrl : function(from, profileUrl) {
               	Titanium.API.info("updateProfileUrl: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
					Ti.App.fireEvent('UPDATED_PROFILE_URL', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'UPDATED_PROFILE_URL');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('UPDATED_PROFILE_URL', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('updateProfileUrl: onload: Entered - ' + this.responseText);
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null && jsonNodeData.result > 0) {
						Titanium.API.info('updateProfileUrl: onload: SUCCESS');
						Ti.App.fireEvent('UPDATED_PROFILE_URL', { status:0, profileUrl:jsonNodeData.value });
					}
					else {
						Ti.App.fireEvent('UPDATED_PROFILE_URL', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var userUrl = '/resources/users/update';
				var targetURL = secureBaseUrl + userUrl;
				Titanium.API.info('updateProfileUrl: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
				var modId = Titanium.Network.encodeURIComponent(from);
				var modUrl = Titanium.Network.encodeURIComponent(profileUrl);
				var updateTask = { llId:modId, object:'User', field:'profileUrl', value:modUrl, result: 0 };
				var str = JSON.stringify(updateTask);
                xhr.send(str);	
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
					Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'LOCAL_MSG_EVENTS_RECD');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					if (this.status == httpCodes.NO_CONTENT) {
						Titanium.API.info('getLocalMsgEvents: onload: Returning empty set');
						Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { result:[], status:0 });
						return;
					}
					Titanium.API.info('getLocalMsgEvents: onload: Entered - [' + this.responseText + ']');
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getLocalMsgEvents: onload: SUCCESS');
							Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { result: jsonNodeData, status:0 });
						}
						else {
							Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
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
					Ti.App.fireEvent('REMOTE_MSG_EVENTS_RECD', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'REMOTE_MSG_EVENTS_RECD');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('REMOTE_MSG_EVENTS_RECD', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					if (this.status == httpCodes.NO_CONTENT) {
						Titanium.API.info('getRemoteMsgEvents: onload: Returning empty set');
						Ti.App.fireEvent('REMOTE_MSG_EVENTS_RECD', { result:[], status:0 });
						return;
					}
					Titanium.API.info('getRemoteMsgEvents: onload: Entered - [' + this.responseText + ']');
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getRemoteMsgEvents: onload: SUCCESS');
							Ti.App.fireEvent('REMOTE_MSG_EVENTS_RECD', { result:jsonNodeData, status:0 });
						}
						else {
							Ti.App.fireEvent('REMOTE_MSG_EVENTS_RECD', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('REMOTE_MSG_EVENTS_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
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
					Ti.App.fireEvent('SEARCH_RESULTS_RECD', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'SEARCH_RESULTS_RECD');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('SEARCH_RESULTS_RECD', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('searchLakesByKeyword: onload: Entered - [' + this.responseText + ']');
					if (this.responseText == 'null' || this.responseText == undefined) {
						Titanium.API.info('searchLakesByKeyword: onload: Returning empty set');
						Ti.App.fireEvent('SEARCH_RESULTS_RECD', { result:[], status:0 });
						return;
					}
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('searchLakesByKeyword: onload: SUCCESS');
							Ti.App.fireEvent('SEARCH_RESULTS_RECD', { result:jsonNodeData, status:0 });
						}
						else {
							Ti.App.fireEvent('SEARCH_RESULTS_RECD', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('SEARCH_RESULTS_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
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
			/*
			 * This method returns the reports that we have for a requested state
			 */
			getReportsByState : function(state) {
               	Titanium.API.info("getReportsByState: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
					Ti.App.fireEvent('REPORT_DATA_RECD', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'REPORT_DATA_RECD');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('REPORT_DATA_RECD', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					if (this.status == httpCodes.NO_CONTENT) {
						Titanium.API.info('getReportsByState: onload: Returning empty set');
						Ti.App.fireEvent('REPORT_DATA_RECD', { result:[], status:0 });
						return;
					}
					Titanium.API.info('getReportsByState: onload: Entered - [' + this.responseText + ']');
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getReportsByState: onload: SUCCESS');
							Ti.App.fireEvent('REPORT_DATA_RECD', { result:jsonNodeData, status:0 });
						}
						else {
							Ti.App.fireEvent('REPORT_DATA_RECD', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('REPORT_DATA_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var targetURL = myReportRestURL + 'state/' + state;
				Titanium.API.info('getReportsByState: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getReportsByState: Trying to get msgs from server ... ');
                xhr.send();	
			},
			getShortReportsByState : function(state) {
               	Titanium.API.info("getShortReportsByState: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
					Ti.App.fireEvent('SHORT_REPORT_DATA_RECD', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'SHORT_REPORT_DATA_RECD');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('SHORT_REPORT_DATA_RECD', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					if (this.status == httpCodes.NO_CONTENT) {
						Titanium.API.info('getShortReportsByState: onload: Returning empty set');
						Ti.App.fireEvent('SHORT_REPORT_DATA_RECD', { result:[], status:0 });
						return;
					}
					Titanium.API.info('getShortReportsByState: onload: Entered - [' + this.responseText + ']');
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getShortReportsByState: onload: SUCCESS');
							Ti.App.fireEvent('SHORT_REPORT_DATA_RECD', { result:jsonNodeData, status:0 });
						}
						else {
							Ti.App.fireEvent('SHORT_REPORT_DATA_RECD', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('SHORT_REPORT_DATA_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var targetURL = myReportRestURL + 'lakes/' + state;
				Titanium.API.info('getShortReportsByState: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getShortReportsByState: Trying to get msgs from server ... ');
                xhr.send();	
			},
			getReportByReportId : function(reportId) {
               	Titanium.API.info("getReportByReportId: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
					Ti.App.fireEvent('ONE_REPORT_RECD', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'ONE_REPORT_RECD');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('ONE_REPORT_RECD', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('getReportByReportId: onload: Entered - [' + this.responseText + ']');
					if (this.responseText == 'null' || this.responseText == undefined) {
						Titanium.API.info('getShortReportsByState: onload: Returning empty set');
						Ti.App.fireEvent('ONE_REPORT_RECD', { result:[], status:0 });
						return;
					}
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getReportByReportId: onload: SUCCESS');
							Ti.App.fireEvent('ONE_REPORT_RECD', { result:jsonNodeData, status:0 });
						}
						else {
							Ti.App.fireEvent('ONE_REPORT_RECD', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('ONE_REPORT_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var targetURL = myReportRestURL + 'reportId/' + reportId 
				Titanium.API.info('getReportByReportId: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getReportByReportId: Trying to get msgs from server ... ');
                xhr.send();	
			},
			getHotSpotsByLake : function(resourceId) {
               	Titanium.API.info("getHotSpotsByLake: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
					Ti.App.fireEvent('HOTSPOT_DATA_RECD', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'HOTSPOT_DATA_RECD');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('HOTSPOT_DATA_RECD', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					if (this.status == httpCodes.NO_CONTENT) {
						Titanium.API.info('getHotSpotsByLake: onload: Returning empty set');
						Ti.App.fireEvent('HOTSPOT_DATA_RECD', { result:[], status:0 });
						return;
					}
					Titanium.API.info('getHotSpotsByLake: onload: Entered - [' + this.responseText + ']');
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getHotSpotsByLake: onload: SUCCESS');
							Ti.App.fireEvent('HOTSPOT_DATA_RECD', { result:jsonNodeData, status:0 });
						}
						else {
							Ti.App.fireEvent('HOTSPOT_DATA_RECD', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('HOTSPOT_DATA_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var targetURL = myHotSpotRestURL + 'lakes/' + resourceId;
				Titanium.API.info('getHotSpotsByLake: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getHotSpotsByLake: Trying to get msgs from server ... ');
                xhr.send();	
			},
			getHotSpotsByUserToken : function(userToken) {
               	Titanium.API.info("getHotSpotsByUserToken: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
					Ti.App.fireEvent('HOTSPOT_DATA_RECD', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'HOTSPOT_DATA_RECD');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('HOTSPOT_DATA_RECD', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					if (this.status == httpCodes.NO_CONTENT) {
						Titanium.API.info('getHotSpotsByUserToken: onload: Returning empty set');
						Ti.App.fireEvent('HOTSPOT_DATA_RECD', { result:[], status:0 });
						return;
					}
					Titanium.API.info('getHotSpotsByUserToken: onload: Entered - [' + this.responseText + ']');
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getHotSpotsByUserToken: onload: SUCCESS');
							Ti.App.fireEvent('HOTSPOT_DATA_RECD', { result:jsonNodeData, status:0 });
						}
						else {
							Ti.App.fireEvent('HOTSPOT_DATA_RECD', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('HOTSPOT_DATA_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var targetURL = myHotSpotRestURL + 'users/' + userToken;
				Titanium.API.info('getHotSpotsByUserToken: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getHotSpotsByUserToken: Trying to get msgs from server ... ');
                xhr.send();	
			},
			//
			// This method determines if the user's location is inside a pre-defined lake polygon	
			//
			ping : function(llId, lat, lng) {
               	Titanium.API.info("ping: Entered");
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	Titanium.API.info('EXCEPTION :: ' + e.source.responseText);
					if (status > httpCodes.OK) {
						handleErrorResp(e.source.status, 'PING_RESPONSE_DATA');	
						return;
					}
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'PING_RESPONSE_DATA');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						return;
					}
					if (Tools.test4ServerDown(this.responseText)) {
						Ti.App.fireEvent('PING_RESPONSE_DATA', { status:59,
							errorMsg: 'Unable to communicate with the server at this time. Please try again in a little while'	
						});
					}
					Titanium.API.info('ping: onload: Entered - [' + this.responseText + ']');
					if (this.responseText == 'null' || this.responseText == undefined) {
						Ti.App.fireEvent('PING_RESPONSE_DATA', { result:null, status:0 });
						return;
					}
					if (this.responseText == 'null' || this.responseText == undefined) {
						Titanium.API.info('ping: onload: Returning empty set');
						Ti.App.fireEvent('PING_RESPONSE_DATA', { result:null, status:0 });
						return;
					}
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('ping: onload: SUCCESS');
							Ti.App.fireEvent('PING_RESPONSE_DATA', {
								result: jsonNodeData,
								status: 0
							});
						}
						else {
							Ti.App.fireEvent('PING_RESPONSE_DATA', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('PING_RESPONSE_DATA', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var userUrl = '/resources/users/ping';
				var targetURL = secureBaseUrl + userUrl;
				// var targetURL = baseUrl + userUrl;
				Titanium.API.info('ping: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
				var modId = Titanium.Network.encodeURIComponent(llId);
				var deviceId = Titanium.Network.encodeURIComponent(model.getDeviceId());
				var pingData = { llId:modId, deviceId:deviceId, lat:lat, lng:lng };
				var str = JSON.stringify(pingData);
                //
                // send HTTP request
                //
                Titanium.API.info('ping: Trying to determine if the user is inside of the lake polygon');
                xhr.send(str);	
			}
    };
    return myClient;
};
