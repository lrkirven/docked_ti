var win = Ti.UI.currentWindow;
var model = win.model;

//
// Login Status
//
var label = Ti.UI.createLabel({
	text:'Logged In = ' + Titanium.Facebook.isLoggedIn(),
	font:{fontSize:14},
	height:'auto',
	top:10,
	textAlign:'center'
});
win.add(label);

// capture
Titanium.Facebook.addEventListener('login', function() {
	label.text = 'Logged In = ' + Titanium.Facebook.isLoggedIn();
	Ti.API.info('Got login event ----> ' + Titanium.Facebook.isLoggedIn());	
});

//
// Facebook Login Button
//
var fbButton = Titanium.Facebook.createLoginButton({
	'style':'wide',
	'apikey':model.getFBAPIKey(),
	'secret':model.getFBSecret(),
	bottom:30,
	height:30,
	width:300
});
win.add(fbButton);

fbButton.addEventListener('login',function() {
	label.text = 'Logged In = ' + Titanium.Facebook.isLoggedIn();
	Ti.API.info('fbButton login event fired');	
});

fbButton.addEventListener('logout', function() {
	label.text = 'Logged In = ' + Titanium.Facebook.isLoggedIn();	
	Ti.API.info('fbButton logout event fired');	
});
