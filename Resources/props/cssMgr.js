function CSSMgr() {
	
    // var color0 = '#212226';
    var color0 = '#232928';
	// var color1 = '#F0EAC3';
	var color1 = '#EEEFB9';
	// var color2 = '#687067';
	// var color2 = '#6ACFAE';
	var color2 = '#CCCCCC';
	var color3 = '#B03831';
	// var color3 = '#EEEFB9';
	var color4 = '#369C93';
	// var color4 = '#B03831';
	var color5 = '#3f0200';

    this.singletonInstance = null;

    var getInstance = function() {
        if (!this.singletonInstance) { 
            this.singletonInstance = createInstance();
        }
        return this.singletonInstance;
    };

    // Create an instance of the Cats class
    var createInstance = function() {
        // Here, you return all public methods and variables
        return {
			getColor0 : function() {
				return color0;
			},
			getColor1 : function() {
				return color1;
			},
			getColor2 : function() {
				return color2;
			},
			getColor3 : function() {
				return color3;
			},
			getColor4 : function() {
				return color4;
			},
			getColor5 : function() {
				return color5;
			}
        };
    };

    return getInstance();
}