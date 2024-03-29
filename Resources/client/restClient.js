
function RestClient() {
	
	// var secureBaseUrl = 'https://www.zarcode4fishin.appspot.com';
	// var baseUrl = 'http://mobile.lazylaker.net';
	var secureBaseUrl = 'https://dockedmobile.appspot.com';
	var baseUrl = 'http://dockedmobile.appspot.com';
	var version = Common.VERSION; 
	var myMsgRestURL = baseUrl + '/resources/' + version + '/buzz/';
	var myMsgRestURLSecure = secureBaseUrl + '/resources/' + version + '/buzz/';
	var myLakeRestURL = baseUrl + '/resources/' + version + '/lakes/';
	var myLakeRestURLSecure = secureBaseUrl + '/resources/' + version + '/lakes/';
	var myUserRestURL = baseUrl + '/resources/' + version + '/users/';
	var myUserRestURLSecure = secureBaseUrl + '/resources/' + version + '/users/';
	var myReportRestURL = baseUrl + '/resources/' + version + '/reports/';
	var myReportRestURLSecure = secureBaseUrl + '/resources/' + version + '/reports/';
	var myHotSpotRestURL = baseUrl + '/resources/' + version + '/hotspots/';
	var myHotSpotRestURLSecure = baseUrl + '/resources/' + version + '/hotspots/';
	var myPhotoRestURL = baseUrl + '/resources/' + version + '/photos/';
	var myPhotoRestURLSecure = baseUrl + '/resources/' + version + '/photos/';
	
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
			/**
			 * This method posts a message by the user to a specific lake resource (or region)
			 *  
			 * @param {Object} llId
			 * @param {Object} msg
			 * @param {Object} addToMyHotSpots
			 */
			postMessage : function(llId, msg, addToMyHotSpots) {
               	Titanium.API.info("postMessage: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('NEW_MSG_EVENT_ADDED', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
				var targetURL = myMsgRestURLSecure + appContent + "?addToMyHotSpots=" + addToMyHotSpots ;
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
			/**
			 * This method posts a comment on an existing buzz message.
			 * 
			 * @param {Object} from
			 * @param {Object} comment
			 */
			postComment : function(llId, comment) {
               	Titanium.API.info("postComment: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('NEW_COMMENT_ADDED', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
				var targetURL = myMsgRestURLSecure + appContent;
				Titanium.API.info('postComment: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
				var modId = Titanium.Network.encodeURIComponent(llId);
				comment.llId = modId;
				var str = JSON.stringify(comment);
                Titanium.API.info('postComment: Posting JSON msg (comment) to server ... ' + str);
                xhr.send(str);	
			},
			/**
			 * This method returns the currently active bucket.
			 */
			getActiveBucket : function() {
               	Titanium.API.info("getActiveBucket: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('ACTIVE_BUCKET', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
					Ti.App.fireEvent('ACTIVE_BUCKET', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'ACTIVE_BUCKET');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('ACTIVE_BUCKET', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('getActiveBucket: onload: Entered - [' + this.responseText + ']');
					if (this.responseText == 'null' || this.responseText == undefined) {
						Titanium.API.info('getActiveBucket: onload: Returning empty set');
						Ti.App.fireEvent('ACTIVE_BUCKET', { result:[], status:0 });
						return;
					}
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getActiveBucket: onload: SUCCESS');
							Ti.App.fireEvent('ACTIVE_BUCKET', { result:jsonNodeData, status:0 });
						}
						else {
							Ti.App.fireEvent('ACTIVE_BUCKET', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('ACTIVE_BUCKET', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var targetURL = myPhotoRestURL + 'activeBucket'; 
				Titanium.API.info('getActiveBucket: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getActiveBucket: ... ');
                xhr.send();	
			},
			/**
			 * This method add or updates user-defined hotspot on the server.
			 * 
			 * @param {Object} userToken
			 * @param {Object} hotSpot
			 * @param {Object} newFlag
			 */
			addOrUpdateHotSpot : function(userToken, hotSpot, newFlag) {
               	Titanium.API.info("addOrUpdateHotSpot: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('NEW_HOTSPOT_ADDED', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
				var xhr = Ti.Network.createHTTPClient();
				var newInstFlag = newFlag;
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
					Titanium.API.info('addOrUpdateHotSpot: onload: Entered - ' + this.responseText);
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('addOrUpdateHotSpot: onload: SUCCESS');
							Ti.App.fireEvent('NEW_HOTSPOT_ADDED', { result: jsonNodeData, status:0 });
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
				var targetURL =  myHotSpotRestURL + 'addOrUpdate' + '?userToken=' + userToken ;
				Titanium.API.info('addOrUpdateHotSpot: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
				var str = JSON.stringify(hotSpot);
                Titanium.API.info('addOrUpdateHotSpot: Posting JSON msg (hotSpot) to server ... ' + str);
                xhr.send(str);	
			},
			/**
			 * This method registers the user with an Docked account.
			 * 
			 * @param {Object} emailAddr
			 * @param {Object} displayName
			 * @param {Object} registerSecret
			 */
			registerUser : function(emailAddr, displayName, registerSecret) {
               	Titanium.API.info("registerUser: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('USER_REGISTERED', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
				var targetURL = myUserRestURLSecure + 'register';
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
			/**
			 * This method updates the user's display name.
			 * 
			 * @param {Object} from
			 * @param {Object} displayName
			 */
			updateDisplayName : function(from, displayName) {
               	Titanium.API.info("updateDisplayName: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('UPDATED_DISPLAY_NAME', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
				var targetURL = myUserRestURLSecure + 'update';
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
			/**
			 * This method updates the user profile URL.
			 * 
			 * @param {Object} from
			 * @param {Object} profileUrl
			 */
			updateProfileUrl : function(from, profileUrl) {
               	Titanium.API.info("updateProfileUrl: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('UPDATED_PROFILE_URL', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
						if (jsonNodeData.value == 'NULL') {
							Ti.App.fireEvent('UPDATED_PROFILE_URL', { status:0, profileUrl:null });
						}
						else {
							var url = Titanium.Network.decodeURIComponent(jsonNodeData.value);
							Ti.App.fireEvent('UPDATED_PROFILE_URL', { status:0, profileUrl:url });
							// Ti.App.fireEvent('UPDATED_PROFILE_URL', { status:0, profileUrl:profileUrl });
						}
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
				var targetURL = myUserRestURLSecure + 'update';
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
			/**
			 * This method provides feedback from the user.
			 * 
			 * @param {Object} from
			 * @param {Object} feedback
			 */
			addFeedback : function(from, feedback) {
               	Titanium.API.info("addFeedback: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('ADD_FEEDBACK_RESP', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	Titanium.API.info("some error");
					Ti.App.fireEvent('ADD_FEEDBACK_RESP', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'ADD_FEEDBACK_RESP');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('ADD_FEEDBACK_RESP', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('addFeedback: onload: Entered - ' + this.responseText);
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null && jsonNodeData.result > 0) {
						Titanium.API.info('addFeedback: onload: SUCCESS');
						Ti.App.fireEvent('ADD_FEEDBACK_RESP', { displayName:jsonNodeData.value, status:0 });
					}
					else {
						Ti.App.fireEvent('ADD_FEEDBACK_RESP', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var targetURL = myUserRestURLSecure + 'feedback';
				Titanium.API.info('addFeedback: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('addFeedback: Posting to server ... ' + from);
				var modId = Titanium.Network.encodeURIComponent(from);
				var feedbackAction = { llId:modId, value:feedback };
				var str = JSON.stringify(feedbackAction);
                xhr.send(str);	
			},
			reportAbuse : function(from, abuseInfo) {
               	Titanium.API.info("reportAbuse: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('REPORT_ABUSE_RESP', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
                	Titanium.API.info("some error");
					Ti.App.fireEvent('REPORT_ABUSE_RESP', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'REPORT_ABUSE_RESP');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('REPORT_ABUSE_RESP', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('reportAbuse: onload: Entered - ' + this.responseText);
					var jsonNodeData = JSON.parse(this.responseText);
					if (jsonNodeData != null && jsonNodeData.result > 0) {
						Titanium.API.info('reportAbuse: onload: SUCCESS');
						Ti.App.fireEvent('REPORT_ABUSE_RESP', { displayName:jsonNodeData.value, status:0 });
					}
					else {
						Ti.App.fireEvent('REPORT_ABUSE_RESP', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var targetURL = myUserRestURLSecure + 'reportAbuse';
				Titanium.API.info('reportAbuse: REST URL: ' + targetURL);
                xhr.open('POST', targetURL);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('reportAbuse: Posting to server ... ' + from);
				var modId = Titanium.Network.encodeURIComponent(from);
				var abuseReport = { llId:modId, value:abuseInfo };
				var str = JSON.stringify(abuseReport);
                xhr.send(str);	
			},
			/**
			 * This method retrieves top 50 messages posted to the requested lake polygon resource.
			 * 
			 * @param {Object} resKey
			 */
			getLocalMsgEvents : function(resKey) {
               	Titanium.API.info("getLocalMsgEvents: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('LOCAL_MSG_EVENTS_RECD', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
				var targetURL = myMsgRestURL + resKey + '?lat=' + model.getUserLat() + '&lng=' + model.getUserLng();
				Titanium.API.info('getLocalMsgEvents: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getLocalMsgEvents: Trying to get msgs from server ... ');
                xhr.send();	
			},
			/**
			 * This method gets buzz messages from a visiting location.
			 * 
			 * @param {Object} resKey
			 */
			getRemoteMsgEvents : function(resKey) {
               	Titanium.API.info("getRemoteMsgEvents: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('REMOTE_MSG_EVENTS_RECD', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
				var targetURL = myMsgRestURL + resKey + '?lat=' + model.getUserLat() + '&lng=' + model.getUserLng();
				Titanium.API.info('getRemoteMsgEvents: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getRemoteMsgEvents: Trying to get msgs from server ... ');
                xhr.send();	
			},
			/**
			 * This method searches for a water resource based upon the user provided text.
			 * 
			 * @param {Object} keyword
			 */
			searchLakesByKeyword : function(keyword) {
               	Titanium.API.info("searchLakesByKeyword: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('SEARCH_RESULTS_RECD', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
				var k = Titanium.Network.encodeURIComponent(keyword);
				var targetURL = myLakeRestURL + 'search/' + k + '?lat=' + model.getActualLat() + '&lng=' + model.getActualLng();
				Titanium.API.info('searchLakesByKeyword: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('searchLakesByKeyword: Trying to get msgs from server ... ');
                xhr.send();	
			},
			getClosestResources : function(lat, lng) {
               	Titanium.API.info('getClosestResources: Entered');
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('CLOSEST_RES_RECD', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
					Ti.App.fireEvent('CLOSEST_RES_RECD', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'CLOSEST_RES_RECD');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('CLOSEST_RES_RECD', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('getClosestResources: onload: Entered - [' + this.responseText + ']');
					if (this.responseText == 'null' || this.responseText == undefined) {
						Titanium.API.info('getClosestResources: onload: Returning empty set');
						Ti.App.fireEvent('CLOSEST_RES_RECD', { result:[], status:0 });
						return;
					}
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getClosestResources: onload: SUCCESS');
							Ti.App.fireEvent('CLOSEST_RES_RECD', { result:jsonNodeData, status:0 });
						}
						else {
							Ti.App.fireEvent('CLOSEST_RES_RECD', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('CLOSEST_RES_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var targetURL = myLakeRestURL + 'closest?lat=' + lat + '&lng=' + lng;
				Titanium.API.info('getClosestResources: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getClosestResources: Invoking... ');
                xhr.send();	
			},
			/**
			 * This method returns the reports that we have for a requested state
			 * 
			 * @param {Object} state
			 */
			getReportsByState : function(state) {
               	Titanium.API.info('getReportsByState: Entered');
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
			/**
			 * This method returns a list of available water resources from the provided state.
			 * 
			 * @param {Object} state
			 */
			getShortReportsByState : function(state) {
               	Titanium.API.info("getShortReportsByState: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('SHORT_REPORT_DATA_RECD', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
			/**
			 * This method gets specific report based upon reportId.
			 * 
			 * @param {Object} reportId
			 */
			getReportByReportId : function(reportId) {
               	Titanium.API.info("getReportByReportId: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('ONE_REPORT_RECD', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
						Titanium.API.info('getReportByReportId: onload: Returning empty set');
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
				var targetURL = myReportRestURL + 'reportId/' + reportId; 
				Titanium.API.info('getReportByReportId: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getReportByReportId: Trying to get msgs from server ... ');
                xhr.send();	
			},
			getRecentReportData : function() {
				
               	Titanium.API.info('getRecentReportData: Entered');
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('RECENT_REPORT_DATA_RECD', { status:69, errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
				var xhr = Ti.Network.createHTTPClient();
                xhr.setTimeout(90000);
				
                // 
                // error
                //
                xhr.onerror = function(e) {
					Ti.App.fireEvent('RECENT_REPORT_DATA_RECD', { status:69,
						errorMsg: 'Unable to connect to remote services -- Please check your network connection'	
					});
                }; 
            
                // 
                // success    
                //
                xhr.onload = function() {
					if (this.status >= httpCodes.BAD_REQUEST) {
						handleErrorResp(this.status, 'RECENT_REPORT_DATA_RECD');	
						return;
					}
					if (Tools.test4NotFound(this.responseText)) {
						Ti.App.fireEvent('RECENT_REPORT_DATA_RECD', { status:89,
							errorMsg: 'Unable complete request at this time -- Apologize for the service failure.'	
						});
						return;
					}
					Titanium.API.info('getReportByReportId: onload: Entered - [' + this.responseText + ']');
					if (this.responseText == 'null' || this.responseText == undefined) {
						Titanium.API.info('getReportByReportId: onload: Returning empty set');
						Ti.App.fireEvent('RECENT_REPORT_DATA_RECD', { result:[], status:0 });
						return;
					}
					if (this.responseText != null) {
						var jsonNodeData = JSON.parse(this.responseText);
						if (jsonNodeData != null) {
							Titanium.API.info('getReportByReportId: onload: SUCCESS');
							Ti.App.fireEvent('RECENT_REPORT_DATA_RECD', { result:jsonNodeData, status:0 });
						}
						else {
							Ti.App.fireEvent('RECENT_REPORT_DATA_RECD', { status:99,
								errorMsg: 'Unable to complete request at this time'	
							});
						}
					}
					else {
						Ti.App.fireEvent('RECENT_REPORT_DATA_RECD', { status:99,
							errorMsg: 'Unable to complete request at this time'	
						});
					}
                };

                //
                // create connection
                //
				var targetURL = myReportRestURL + 'toplevel'; 
				Titanium.API.info('getRecentReportData: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getRecentReportData: Trying to get recent report data ... ');
                xhr.send();	
			},
			/**
			 * This method returns all of the PUBLIC hotpsots for a specific water resource.
			 * 
			 * @param {Object} resKey
			 */
			getHotSpotsByLake : function(resKey) {
               	Titanium.API.info("getHotSpotsByLake: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('HOTSPOT_DATA_RECD', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
				var targetURL = myHotSpotRestURL + 'lakes/' + resKey;
				Titanium.API.info('getHotSpotsByLake: REST URL: ' + targetURL);
                xhr.open('GET', targetURL);
				xhr.setRequestHeader('Accept', 'application/json');
                //
                // send HTTP request
                //
                Titanium.API.info('getHotSpotsByLake: Trying to get msgs from server ... ');
                xhr.send();	
			},
			/**
			 * This method returns ALL of the hotspots owned by current user.
			 * 
			 * @param {Object} userToken
			 */
			getHotSpotsByUserToken : function(userToken) {
               	Titanium.API.info("getHotSpotsByUserToken: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('HOTSPOT_DATA_RECD', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
			/**
			 * This method updates the server of the location of the current user and returns polygon information
			 * based upon on the updated location.
			 * 
			 * @param {Object} llId
			 * @param {Object} lat
			 * @param {Object} lng
			 */
			ping : function(llId, lat, lng) {
               	Titanium.API.info("ping: Entered");
				
				if (!Titanium.Network.online) {
					Ti.App.fireEvent('PING_RESPONSE_DATA', { status:69,
						errorMsg: Msgs.NO_DATA_SERVICE
					});
				}
				
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
				var targetURL = myUserRestURLSecure + 'ping';
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
