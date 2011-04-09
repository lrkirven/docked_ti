
	var HotSpot = {}; // HotSpot namespace

	HotSpot.categoryList = [{
			title: 'General',
			header: 'General',
			color: CSSMgr.color2,
			selectedColor: CSSMgr.color0,
			category:0
		}, {
			title: 'Catch',
			header: 'Fishing',
			color: CSSMgr.color2,
			selectedColor: CSSMgr.color0,
			category:100
		}, {
			title: 'Bait',
			color: CSSMgr.color2,
			selectedColor: CSSMgr.color0,
			category:101
		},{
			title: 'Launch',
			header: 'Boating',
			color: CSSMgr.color2,
			selectedColor: CSSMgr.color0,
			category:200
		},{
			title: 'Hazard',
			color: CSSMgr.color2,
			selectedColor: CSSMgr.color0,
			category:201
		},{
			title: 'Parking',
			header: 'Swimming',
			color: CSSMgr.color2,
			selectedColor: CSSMgr.color0,
			category:300
		},{
			title: 'Restaurants',
			color: CSSMgr.color2,
			selectedColor: CSSMgr.color0,
			category:301
		}
	];
	
	HotSpot.formatDataForHeaders = function(list) {
		var i = 0;
		var modList = [];	
		var hotSpot = null;
		var currentCat = -1;
		var map = { current: null };
		
		for (i=0; i<list.length; i++) {
			hotSpot = list[i];
			if (hotSpot.category < 100) {
				if (map.current != 'General') {
					hotSpot.header = 'General';
					map.current = 'General';
				}
			}
			else if (hotSpot.category < 200) {
				if (map.current != 'Fishing') {
					hotSpot.header = 'Fishing';
					map.current = 'Fishing';
				}
			}
			else if (hotSpot.category < 300) {
				if (map.current != 'Boating') {
					hotSpot.header = 'Boating';
					map.current = 'Boating';
				}
			}
			else if (hotSpot.category < 400) {
				if (map.current != 'Swimming') {
					hotSpot.header = 'Swimming';
					map.current = 'Swimming';
				}
			}
			modList.push(hotSpot);
		}
		return modList;
	};