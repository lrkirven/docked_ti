var win = Ti.UI.currentWindow;

Ti.include('../model/modelLocator.js');

var data = [];

Ti.API.info('Entering photoViewer');

var t = Titanium.UI.create2DMatrix();
t = t.scale(0);

var w = Titanium.UI.createWindow({
	backgroundColor:'#212226',
	borderWidth:4,
	borderColor:'#687067',
	height:400,
	width:300,
	borderRadius:10,
	opacity:0.92,
	transform:t
});

// create first transform to go beyond normal size
var t1 = Titanium.UI.create2DMatrix();
t1 = t1.scale(1.1);
var a = Titanium.UI.createAnimation();
a.transform = t1;
a.duration = 200;

// when this animation completes, scale to normal size
a.addEventListener('complete', function() {
	Titanium.API.info('herein complete');
	var t2 = Titanium.UI.create2DMatrix();
	t2 = t2.scale(1.0);
	win.animate({transform:t2, duration:200});
});
		
var photo = Ti.UI.createView({ 
	backgroundImage:'../images/Profile.png',
	top:10,
	left:10,
	width:300,
	height:325,
	clickName:'photo'
});

win.add(photo);

// create a button to close window
var b = Titanium.UI.createButton({
	title:'Close',
	height:30,
	width:100,
	left:190,
	top:350,
	color:'#212226'
});

win.add(b);
		
b.addEventListener('click', function() {
	var t3 = null;
	t3 = t3.scale(0);
	w.close({transform:t3,duration:300});
});

win.open(a);
