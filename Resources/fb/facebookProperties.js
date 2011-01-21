var win = Ti.UI.currentWindow;
//
// Login Button
//
var fbButton = Titanium.Facebook.createLoginButton({
	'style':'wide',
	'apikey':'8851fedb7bd7eef10c642cdaffa7faa9',
	'secret':'4a4cbd0adac0c8ead93f848f93083ad6',
	// 'sessionProxy':'http://api.appcelerator.net/p/fbconnect/',
	bottom:10,
	height:30,
	width:300
});
win.add(fbButton);

var b1 = Ti.UI.createButton({
	title:'Display Properties',
	width:200,
	height:40,
	top:10
});
win.add(b1);

var loggedIn = Ti.UI.createLabel({
	title:'',
	height:'auto',
	width:300,
	top:60,
	font:{fontSize:13},
	color:'#777'
});
win.add(loggedIn);

var userId = Ti.UI.createLabel({
	title:'',
	height:'auto',
	width:300,
	top:80,
	font:{fontSize:13},
	color:'#777'
});
win.add(userId);

var permissions = Ti.UI.createLabel({
	text:'',
	height:'auto',
	width:300,
	top:100,
	font:{fontSize:13},
	color:'#777'
});
win.add(permissions);

b1.addEventListener('click', function() {
	
	Ti.API.info("click called, logged in = "+Titanium.Facebook.isLoggedIn());
	if (Titanium.Facebook.isLoggedIn()==false) {
		Ti.UI.createAlertDialog({title:'Facebook', message:'Login before accessing properties'}).show();
		return;
	}
	loggedIn.text = "Logged In = " + Ti.Facebook.loggedIn;
	userId.text = "User Id = " + Ti.Facebook.userId;
	Ti.API.info('permissions = ' + Ti.Facebook.permissions);
	if (Ti.Facebook.permissions != null) {
		for (var v in Ti.Facebook.permissions) {
			if (v!=null) {
				permissions.text += v + ' value = ' +  Ti.Facebook.permissions[v] + '\n';
			}
		}
	}
});