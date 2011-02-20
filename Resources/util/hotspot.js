
	var HotSpot = {}; // HotSpot namespace

	HotSpot.categoryLabels = ['Catch', 'Launch', 'Bait', 'Other'];
	
	HotSpot.formatDataForHeaders = function(list) {
		var i = 0;
		var modList = [];	
		var hotSpot = null;
		var currentCat = -1;
		
		for (i=0; i<list.length; i++) {
			hotSpot = list[i];
			if (hotSpot.category != currentCat) {
				while (1) {
					currentCat++;
					if (currentCat == hotSpot.category) {
						hotSpot.header = HotSpot.categoryLabels[currentCat];
						Ti.API.info('formatDataForHeaders: Added header = ' + hotSpot.header);
						break;
					}
					else if (currentCat > 5) {
						break;
					}
				}
			}
			modList.push(hotSpot);
		}
		return modList;
	};