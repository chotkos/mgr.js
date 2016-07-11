var interpolate = {
	mappedElements: [],
	mapObjects: [],
	render : function(element){
		var all = document.getElementsByTagName("*");
		for(var i = 0; i < all.length; i++){
			if(all[i].attributes["mgr"]){
				this.mappedElements.push(all[i]);

				var interpKeys = eval(all[i].getAttribute("mgr"));
				//<div mgr="['css color scope.red', 'text scope.name']"></div>
				//element should also has scope property
				for(var l=0;l<interpKeys.length;l++){
					var interpKey = interpKeys[l];
					var splitArray = interpKey.split(' ');
					var method = splitArray[0];
					splitArray.shift();
					var params = splitArray;
					var o = {
						element:all[i],
						interpKey:interpKey,
						method : method,
						params : params,
						oldValue : null,					
					};						
					
					o.oldValue = this.getMapObjectValue(o);
					
					this.mapObjects.push(o);
				}
			
				console.log(all[i]);
			}
		}
	},
	timerFunction: function(){
		//foreach all mapObjects
		for(var k=0;k<this.mapObjects.length;k++){
			//if oldvalue another than current -> run modifications on objects.
			var c = this.mapObjects[k];
			var oldVal = c.oldValue;
			var newVal = this.getMapObjectValue(c);
			if(oldVal!=newVal){
				//make magic here
			}
		}
		
	},
	timerRun:function(){
		setInterval(this.timerFunction(), 500);
	},
	getMapObjectValue(mo) { 
		var o = null;
		if (params > 0) {
			o = mo[method](params[0]);
		} else { 
			o = mo[method]();
		}
		return o;
	}

};
