//files are in the resource folder of titanium project:

Ti.include('../client/sha-aws.js'); 	// file comes from this URL's project: http://aws.amazon.com/code/Amazon-S3/3236824658053653
Ti.include('../client/utf8.js'); 		// code for this file from this URL: http://www.webtoolkit.info/javascript-utf8.html
Ti.include('../util/dateformat.js'); 

function AmazonS3Client(){
	
	// STEP 1:  Change to your S3 credentials.  They can be found at:
	// https://aws-portal.amazon.com/gp/aws/developer/account/index.html?action=access-key
	var awsAccessKeyID = 'AWS ' + 'AKIAJI6BAUFF2NNINGWQ' + ':';
	var awsSecretAccessKey = 'HVa7wxkbNDdzcsx084PnJDPjeUPGnQAAdBncd+UN';
	// STEP 2:  Change your bucket name to a bucket you have on AWS S3.
	var awsBucketName = 'docked';
	
	var filename = '';

	var myClient = {
		
		uploadPhoto : function(id, lake, fileContents) {
		
			var xhr = Ti.Network.createHTTPClient();
			
			xhr.ondatastream = function(e){
				alert('Success?  Check your S3 bucket to be sure.');
			};
			
			xhr.onerror = function(e){
				var errorDetails = e.error + '\n';
				errorDetails += xhr.responseText;
				alert(errorDetails);
			};
			
			xhr.onload = function(){
				Ti.API.info('got my response, http status code ' + this.status);
				var myUrl = 'https://s3.amazonaws.com/' + awsBucketName + '/' + fileName;
				Titanium.App.fireEvent('PHOTO_UPLOADED', {
					loaded: true,
					entry: { url: myUrl } 
				});
			};
			
			
			
			// STEP 4: Change your GMT offset (-0700 is PST)
			var currentDateTime = formatDate(new Date(), 'E, d MMM dd yyyy HH:mm:ss') + ' -0700';
			var tm = formatDate(new Date(), 'yyyyMMddHHmmss');
			//Expected date format for AWS: 'Mon, 30 May 2011 17:00:00 -0700';
			
			xhr.setTimeout(99000);
			
			filename = 'photos/' + lake + '-' + id + '-' + tm + '.png';
			// true or false if it's asynchronous or not (last parameter below for xhr.open)
			xhr.open('PUT', 'https://s3.amazonaws.com/' + awsBucketName + '/' + fileName, false);
			
			var StringToSign = 'PUT\n\n\n' + fileContents.mimeType + '\n' + currentDateTime + '\n/' + AWSBucketName + '/' + fileName;
			var awsSignature = b64_hmac_sha1(awsSecretAccessKey, Utf8.encode(StringToSign));
			var authHeader = awsAccessKeyID.concat(awsSignature);
			// On Android, base64encode() returns a TiBlob, so we must convert this toString in order to work.
			xhr.setRequestHeader('Authorization', Ti.Utils.base64encode(authHeader).toString());
			xhr.setRequestHeader('Content-Type', fileContents.mimeType);
			// The Content-Length header works fine for iOS, but on Android raises an error: "Content-Length header already present"
			//xhr.setRequestHeader('Content-Length', uploadFile.size);
			xhr.setRequestHeader('Host', 's3.amazonaws.com');
			xhr.setRequestHeader('Date', currentDateTime);
			
			// STEP 5:  Help determine why uploading using an iOS device/simulator is successful, but
			//          using an android device/emulator results in the following error:
			//          InvalidArgument:  Authorization header is invalid -- one and only one ' ' (space) required.
			xhr.send(fileContents);
			// To see contents of file, just go here: https://s3.amazonaws.com/BUCKETNAME/FILENAME.JPG
			// Note that S3 is case-sensitive so your file name must be an exact, case senstive match.
		}
	};
	
	return myClient;
};