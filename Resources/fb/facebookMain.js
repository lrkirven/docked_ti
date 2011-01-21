//create table view data object
var data = [
	{title:'Login/Logout', hasChild:true, url:'../fb/facebookLogin.js'},
	{title:'Query', hasChild:true, url:'../fb/facebookQuery.js'},
	{title:'Properties', hasChild:true, url:'../fb/facebookProperties.js'},
	{title:'Publish Stream', hasChild:true, url:'../fb/facebookPublish.js'},
	{title:'Execute', hasChild:true, url:'../fb/facebookExecute.js'}

];


// create table view
var tableview = Titanium.UI.createTableView({
	data:data
});

// create table view event listener
tableview.addEventListener('click', function(e) {
	if (e.rowData.url) {
		var win = Titanium.UI.createWindow({
			url:e.rowData.url,
			title:e.rowData.title
		});
		Titanium.UI.currentTab.open(win,{animated:true});
	}
});

// add table view to the window
Titanium.UI.currentWindow.add(tableview);