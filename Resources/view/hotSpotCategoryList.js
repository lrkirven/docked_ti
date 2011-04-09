Ti.include('../util/common.js');
Ti.include('../util/msgs.js');
Ti.include('../util/tools.js');
Ti.include('../util/geo.js');
Ti.include('../props/cssMgr.js');
Ti.include('../util/hotspot.js');
Ti.include('../model/modelLocator.js');
Ti.include('../props/cssMgr.js');

var win = Ti.UI.currentWindow;
var category = win.category;



function selectItemBasedOnCategory(cat) {
	var i = 0;
	var item = null;
	for (i=0; i<HotSpot.categoryList.length; i++) {
		item = HotSpot.categoryList[i];
		if (item.category == cat) {
			win.selectedCategory = item;
			break;
		}	
	}	
	if (i == HotSpot.categoryList.length) {
		i = 0;
	}
	return i;
}

/**
 * Initial entry
 */
function init() {
	
	// create table view
	var categoryTable = Titanium.UI.createTableView({
		data: HotSpot.categoryList,
		separatorColor:CSSMgr.color2,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
		backgroundColor:CSSMgr.color0,
		allowsSelection: true
	});
	categoryTable.addEventListener('click', function(e) {
		Ti.API.info('User selected ---> ' + e.rowData.category);
		win.selectedCategory = e.rowData;
	});
	
	var index = selectItemBasedOnCategory(category);
	Ti.API.info('Indexing category list with index ---> ' + index);
	categoryTable.selectRow(index);
	
	win.add(categoryTable);
};


init();
