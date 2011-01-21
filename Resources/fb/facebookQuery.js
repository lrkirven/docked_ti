var win = Ti.UI.currentWindow;
//
// Login Button
//
var fbButton = Titanium.Facebook.createLoginButton({
	'style':'wide',
	'apikey':'8851fedb7bd7eef10c642cdaffa7faa9',
	'secret':'4a4cbd0adac0c8ead93f848f93083ad6',
	bottom:10
});
win.add(fbButton);

var b1 = Ti.UI.createButton({
	title:'Run Query',
	width:200,
	height:40,
	top:10
});
win.add(b1);

function getMyFacebookInfo() {
	
	b1.title = 'Loading...';
	var tableView = Ti.UI.createTableView({minRowHeight:100});
	var win = Ti.UI.createWindow({title:'Facebook Query'});
	win.add(tableView);

	// create close button on window nav
	var close = Titanium.UI.createButton({
		title:'Close'
	});
	close.addEventListener('click', function() {
		win.close();
	});
	win.setRightNavButton(close);

	var query = "SELECT uid, name, pic_square, status FROM user where uid = " + Titanium.Facebook.getUserId() ;

	Ti.API.info('user id ' + Titanium.Facebook.getUserId());
	Titanium.Facebook.query(query, function(r) {
		
		var data = [];
		for (var c=0;c<r.data.length;c++) {
			var row = r.data[c];

			var tvRow = Ti.UI.createTableViewRow({
				height:'auto',
				selectedBackgroundColor:'#fff',
				backgroundColor:'#fff'
			});
			var imageView;
			if (Titanium.Platform.name == 'android')  {
				// iphone moved to a single image property - android needs to do the same
				imageView = Ti.UI.createImageView({
					url:row.pic_square == null ? '../images/custom_tableview/user.png' : row.pic_square,
					left:10,
					width:50,
					height:50
				});
			}
			else {
				imageView = Ti.UI.createImageView({
					image:row.pic_square == null ? '../images/custom_tableview/user.png' : row.pic_square,
					left:10,
					width:50,
					height:50
				});

			}
			tvRow.add(imageView);

			var userLabel = Ti.UI.createLabel({
				font:{fontSize:16, fontWeight:'bold'},
				left:70,
				top:5,
				right:5,
				height:20,
				color:'#576996',
				text:row.name
			});
			tvRow.add(userLabel);

			var statusLabel = Ti.UI.createLabel({
				font:{fontSize:13},
				left:70,
				top:25,
				right:20,
				height:'auto',
				color:'#222',
				text:(!row.status || !row.status.message ? 'No status message' : row.status.message)
			});
			tvRow.add(statusLabel);
			
			var e = "[NO EMAIL FOUND]";
			if (row.proxied_email != null) {
				e = row.proxied_email;
			}
			else if (row.uid != null) {
				e = row.uid;
			}
			var emailLabel = Ti.UI.createLabel({
				font:{fontSize:13},
				left:70,
				top:45,
				right:20,
				height:'auto',
				color:'#222',
				text:e
			});
			tvRow.add(emailLabel);

			tvRow.uid = row.uid;

			data[c] = tvRow;
		}
		tableView.setData(data,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.DOWN});
		win.open({modal:true});
		b1.title = 'Run Query';
	});	
};


/**
 * Gets your friends information
 */
function runQuery() {
	
	b1.title = 'Loading...';
	var tableView = Ti.UI.createTableView({minRowHeight:100});
	var win = Ti.UI.createWindow({title:'Facebook Query'});
	win.add(tableView);

	// create close button on window nav
	var close = Titanium.UI.createButton({
		title:'Close'
	});
	close.addEventListener('click', function() {
		win.close();
	});
	win.setRightNavButton(close);

	var query = "SELECT uid, name, pic_square, status, username, proxied_email FROM user ";
	query +=  "where uid IN (SELECT uid2 FROM friend WHERE uid1 = " + Titanium.Facebook.getUserId() + ")"; 
	query += "order by last_name";

	/*	
	var myId = Titanium.Facebook.getUserId();
	var query = "SELECT name,uid, email FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = " + myId + ")";
	*/
	Ti.API.info('user id ' + Titanium.Facebook.getUserId());
	Titanium.Facebook.query(query, function(r) {
		
		var data = [];
		for (var c=0;c<r.data.length;c++) {
			var row = r.data[c];

			var tvRow = Ti.UI.createTableViewRow({
				height:'auto',
				selectedBackgroundColor:'#fff',
				backgroundColor:'#fff'
			});
			var imageView;
			if (Titanium.Platform.name == 'android')  {
				// iphone moved to a single image property - android needs to do the same
				imageView = Ti.UI.createImageView({
					url:row.pic_square == null ? '../images/custom_tableview/user.png' : row.pic_square,
					left:10,
					width:50,
					height:50
				});
			}
			else {
				imageView = Ti.UI.createImageView({
					image:row.pic_square == null ? '../images/custom_tableview/user.png' : row.pic_square,
					left:10,
					width:50,
					height:50
				});

			}
			tvRow.add(imageView);

			var userLabel = Ti.UI.createLabel({
				font:{fontSize:16, fontWeight:'bold'},
				left:70,
				top:5,
				right:5,
				height:20,
				color:'#576996',
				text:row.name
			});
			tvRow.add(userLabel);

			var statusLabel = Ti.UI.createLabel({
				font:{fontSize:13},
				left:70,
				top:25,
				right:20,
				height:'auto',
				color:'#222',
				text:(!row.status || !row.status.message ? 'No status message' : row.status.message)
			});
			tvRow.add(statusLabel);
			
			var e = "[NO EMAIL FOUND]";
			if (row.proxied_email != null) {
				e = row.proxied_email;
			}
			else if (row.uid != null) {
				e = row.uid;
			}
			var emailLabel = Ti.UI.createLabel({
				font:{fontSize:13},
				left:70,
				top:45,
				right:20,
				height:'auto',
				color:'#222',
				text:e
			});
			tvRow.add(emailLabel);

			tvRow.uid = row.uid;

			data[c] = tvRow;
		}
		tableView.setData(data,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.DOWN});
		win.open({modal:true});
		b1.title = 'Run Query';
	});	
};

b1.addEventListener('click', function() {
	if (!Titanium.Facebook.isLoggedIn()) {
		Ti.UI.createAlertDialog({title:'Facebook', message:'Login before running query'}).show();
		return;
	}

	Ti.API.info('Facebook read_stream permission ' + Titanium.Facebook.hasPermission("read_stream"));
	if (!Titanium.Facebook.hasPermission("read_stream")) {
		Titanium.Facebook.requestPermission("read_stream",function(evt) {
			if (evt.success) {
				Titanium.API.info('Running query ....');
				runQuery();
			}
		});
	}
	getMyFacebookInfo();
});
