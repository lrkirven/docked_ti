
function PicasaClient(myEmailAddr, myPassword) {
	var picasaBase = 'http://picasaweb.google.com/data';
	var collectionType = '/feed';
	var projection = '/api';
	var context = '/user/lazylaker71';
	var albumKey = '/albumid/';
	var picasaGoogleServiceName = 'lh2';
	var googleAuthToken = null;
	var rawImage = null;
	var appSource = 'ZARCODE-LazyLaker-1.0';
	var bucketList = null;
	var lastBucket = null;
	
	var myClient = {
		email:myEmailAddr,
		password:myPassword,
		_authorize: function(method) {
			Ti.API.info('_authorize(): Trying to do ClientLogin!!');
			var xhr = Titanium.Network.createHTTPClient();
			var m = method;
			
			var params = {
				accountType:'GOOGLE',
				Email:myClient.email,
				Passwd:myClient.password,
				service:picasaGoogleServiceName,
				source:appSource
			};
			
			// 
			// Failure handler
			//
			xhr.onerror = function(e){
				/*
				Ti.UI.createAlertDialog({
					title: 'Error',
					message: e.error
				}).show();
				*/
				alert('_authorize: errror: ' + e.error);
				Ti.API.info('onerror: ' + e.error);
			};
			xhr.setTimeout(20000);
			
			// 
			// Success handler
			//
			xhr.onload = function(e) {
				/*
				alert('_authorize: ' + this.responseText);
				*/
				Ti.API.info('_authorize(): Got response from server');
				try {
					var results = this.responseText;
					var tokens = results.split("\n");
					for (var i = 0; i < tokens.length; i++) {
						var token = tokens[i];
						var kv = token.split("=");
						if (kv[0] == 'Auth') {
							googleAuthToken = kv[1];
							Ti.API.info('_authorize(): Found auth token: ' + googleAuthToken);
							break;
						}
						else if (kv[0] == 'Error') {
							Ti.API.error('ClientLogin FAILED --> ' + kv[1]);
						}
					}
					if (googleAuthToken != null) {
						if (m == 'upload') {
							Ti.API.info('_authorize(): Trying to upload image ...');
							myClient._upload(myClient.rawImage);
						}
						else if (m == 'getAlbums') {
							Ti.API.info('_authorize(): Trying to get albums ...');
							myClient._getAlbums();
						}
						else {
							alert("Unable to complete service authentication. [1]");	
						}
					}
					else {
						alert("Unable to complete service authentication. [2]");	
						/*
						alert('Unable to retrieve auth token :: ' + this.responseText);
						*/
					}
				} 
				catch (err) {
					Ti.API.info('Unable to authorize client ---> ' + err);
				}
			};
			
			xhr.onsendstream = function(e){
				ind.value = e.progress;
				Ti.API.info('onsendstream: PROGRESS ---> ' + e.progress);
			};
			
			// 
			// open the client
			//
			xhr.open('POST', 'https://www.google.com/accounts/ClientLogin');
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			
			// 
			// invoke request to authorize client on Google
			//
			xhr.send(params);
		},
		
		_createAlbum: function() {
			alert('_createAlbum(): 1');
			var now = new Date();
			var tm = now.format("yyyymmddHHMM");
			var bucketName = 'BUCKET-' + tm;
			var reqXML = '<entry xmlns=\'http://www.w3.org/2005/Atom\' xmlns:media=\'http://search.yahoo.com/mrss/\' xmlns:gphoto=\'http://schemas.google.com/photos/2007\'>' +
				'<title type=\'text\'>' + bucketName + '</title>' +
				'<gphoto:access>public</gphoto:access>' +
				'</entry>';
			
			var xhr = Titanium.Network.createHTTPClient();
				xhr.onerror = function(e){
					Ti.UI.createAlertDialog({
						title: 'Error',
						message: e.error
					}).show();
					Ti.API.info('onerror: ' + e.error);
					Titanium.App.fireEvent('ALBUM_CREATED', {
						loaded: false
					});
				};
					
				xhr.setTimeout(20000);
				
				xhr.onload = function(e){
					Ti.API.info('onload: Created album.' + e);
					lastBucket = null;
				};
					
				xhr.onsendstream = function(e){
					ind.value = e.progress;
					Ti.API.info('onsendstream: PROGRESS ---> ' + e.progress);
				};
				
				// open the client
				var gUrl = picasaBase + collectionType + projection + context;
				var modUrl = gUrl + '?alt=json';
				xhr.open('POST', modUrl);
				// HTTP headers			
				xhr.setRequestHeader('Content-Type', 'text/xml');
				xhr.setRequestHeader('Authorization', 'GoogleLogin auth=' + googleAuthToken);
				// send the data
				xhr.send(reqXML);
		},
		
		_upload: function(image) {
			//
			// check for google authorization token
			//
			if (googleAuthToken == null) {
				Ti.API.info('upload: Start authorizing ...');
				myClient._authorize('upload');
			}
			//
			// check if we have last bucket
			//
			else if (lastBucket == null) {
				Ti.API.info('upload: Get last bucket ...');
				myClient._getAlbums('upload');
			}
			//
			// if here, we must be ready to upload
			//
			else {
				var xhr = Titanium.Network.createHTTPClient();
				xhr.setTimeout(20000);
				
				// error
				xhr.onerror = function(e) {
					var d = Ti.UI.createAlertDialog({
						title: 'Error',
						message: e.error
					});
					d.show();
					alert('Photo uploading FAILED --' + e.error);
					Ti.API.info('onerror: ' + e.error);
					Titanium.App.fireEvent('PHOTO_LOADED', {
						loaded: false
					});
				};
					
				// success	
				xhr.onload = function(e) {
					Ti.API.info('onload:  status=' + this.status + ' readyState=' + this.readyState + ' event=' + e);
					var jsonNodeData = JSON.parse(this.responseText);
					var j = null;
					var newEntry = {};
					for (j in jsonNodeData.entry) {
						if (j != null) {
							if (j == 'id') {
								newEntry.id = jsonNodeData.entry[j].$t;
							}
							else if (j == 'gphoto$id') {
								newEntry.photoId = jsonNodeData.entry[j].$t;
							}
							else if (j == 'gphoto$albumid') {
								newEntry.albumId = jsonNodeData.entry[j].$t;
							}
							else if (j == 'gphoto$timestamp') {
								newEntry.timestamp = jsonNodeData.entry[j].$t;
							}
							else if (j == 'content') {
								newEntry.contentType = jsonNodeData.entry[j].type;
								newEntry.url = jsonNodeData.entry[j].src;
							}
						}
					}
					
					if (lastBucket != null && lastBucket.remainingPhotos < 5) {
						// need to create a new bucket	
						alert('Trying to creata a new bucket ...');
						myClient._createAlbum();
					}
					Titanium.App.fireEvent('PHOTO_UPLOADED', {
						loaded: true,
						entry: newEntry
					});
				};
				
				// in progress	
				xhr.onsendstream = function(e){
					ind.value = e.progress;
					Ti.API.info('onsendstream: PROGRESS ---> ' + e.progress);
				};
				
				// open the client
				var gUrl = picasaBase + collectionType + projection + context + albumKey + lastBucket.albumId;
				var modUrl = gUrl + '?alt=json';
				xhr.open('POST', modUrl);
				// HTTP headers			
				xhr.setRequestHeader('Content-Type', 'image/png');
				xhr.setRequestHeader('Authorization', 'GoogleLogin auth=' + googleAuthToken);
				// xhr.setRequestHeader('Slug', filename);
				// send the data
				xhr.send(image);
			}
		},
		upload: function(e, p, b) {
			myClient.rawImage = b;
			if (googleAuthToken == null) {
				// alert('upload: authorizing ...');
				Ti.API.info('upload: authorizing ...');
				myClient._authorize('upload');
			}
			else if (lastBucket == null) {
				// alert('Calling _getAlbums() ...');
				Ti.API.info('upload: Get last bucket ...');
				myClient._getAlbums('upload');		
			}
			else {
				// alert('upload: uploading ...');
				Ti.API.info('upload: Start actual upload ...');
				myClient._upload(b);
			}
		},
		getAlbums:function() {
			if (googleAuthToken == null) {
				Ti.API.info('getAlbums(): No Google Auth Token ... Trying to get one');
				myClient._authorize('getAlbums');
			}
			else {
				Ti.API.info('getAlbums(): Using existing Google Auth Token');
				myClient._getAlbums();
			}
		},
		_getAlbums: function(next) {
			var n = next;
			Ti.API.info('_getAlbums(): Starting process ... Using token=' + googleAuthToken);
			var xhr = Titanium.Network.createHTTPClient();
			
			xhr.onerror = function(e){
				Ti.UI.createAlertDialog({
					title: 'Error',
					message: e.error
				}).show();
				Ti.API.info('Got error for getAlbums() --> ' + e.error);
			};
			
			xhr.setTimeout(20000);
			
			xhr.onload = function(e) {
				Ti.API.info('Got response for getAlbums() --> status=' + this.status + ' readyState=' + this.readyState + ' event=' + e);
				var j = null;
				var tempBucket = null;
				// Ti.API.info('responseText: ' + this.responseText);
				var jsonNodeData = JSON.parse(this.responseText);
				for (j in jsonNodeData.feed) {
					if (j != null && j == 'entry') {
						bucketList = jsonNodeData.feed[j];
						var last = bucketList.length - 1;
						tempBucket = bucketList[last];
					}
				}
				if (tempBucket != null) {
					lastBucket = {};
				}
				for (j in tempBucket) {
					if (j != null) {
						Ti.API.info('k=' + j + ' ---> ' + tempBucket[j]);
						if (j == 'gphoto$numphotosremaining') {
							lastBucket.remainingPhotos = tempBucket[j].$t;
						}
						else if (j == 'gphoto$timestamp') {
							lastBucket.timestamp = tempBucket[j].$t;
						}
						else if (j == 'gphoto$bytesUsed') {
							lastBucket.bytesUsed = tempBucket[j].$t;
						}
						else if (j == 'gphoto$id') {
							lastBucket.albumId = tempBucket[j].$t;
						}
					}
				}
				//if (lastBucket != null) {
				//	Ti.App.fireEvent('FOUND_LAST_BUCKET', { lastBucket: lastBucket });
				//}
				if (n == 'upload') {
					myClient._upload(myClient.rawImage);
				}
			};
			
			xhr.onsendstream = function(e){
				ind.value = e.progress;
				Ti.API.info('onsendstream: PROGRESS ---> ' + e.progress);
			};
			
			// open the client
			var gUrl = picasaBase + collectionType + projection + context;
			var modUrl = gUrl + '?alt=json';
			Ti.API.info('Trying to access URL: ' + modUrl);
			xhr.open('GET', modUrl);
			xhr.setRequestHeader('Authorization', 'GoogleLogin auth=' + googleAuthToken);
			// send the data
			xhr.send();
		}
		
	};
	
	return myClient;
};
