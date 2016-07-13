var interpolate = {
    mappedElements: [],
    mapObjects: [],
    render: function (element) {
        var all = document.getElementsByTagName("*");
        for (var i = 0; i < all.length; i++) {
            if (all[i].attributes["mgr"]) {
                this.mappedElements.push(all[i]);
                var interpKeys = eval(all[i].getAttribute("mgr"));
                //jQuery required
                //<div mgr="['css color scope.color', 'text scope.name']"></div>
                //element should also has scope property
                for (var l = 0; l < interpKeys.length; l++) {
                    var interpKey = interpKeys[l];
                    var splitArray = interpKey.split(' ');
                    var method = splitArray[0];
                    splitArray.shift();
                    var params = splitArray;
                    var o = {
                        element: all[i],
                        interpKey: interpKey,
                        method: method,
                        params: params,
                        oldValueOnElement: null,
                        oldValueOnResource: null,
                        scopeOwner: element,
                        mapFromResource: function () {
                            //jesli wartosc nie jest ze scope tylko np jest nazwa property to inaczej konstruuj eval
                            //if indexof scope. == -1 to wtedy zostaw jako string
                            var p1 = eval(params[0].replace('scope.','this.scopeOwner.scope'));
                            var p2 = eval(params[1].replace('scope.','this.scopeOwner.scope'));
                            eval("$(this.element)[this.method](p1,p2)");
                        },
                        mapFromElement: function () {
                            var field = null;
                            var value = null;
                            if (params.length > 1) {
                                field = "this.scopeOwner" + this.params[1];
                                value = "$(this.element)[this.method](this.params[0])";
                            } else {
                                field = "this.scopeOwner" + this.params[0];
                                value = "$(this.element)[this.method]()";
                            }
                            eval(field + "=" + value);
                        },
                    };
                    o.mapFromResource();
                    o.oldValueOnElement = this.getMapObjectoldValueOnElement(o);
                    o.oldValueOnResource = this.getMapObjectoldValueOnResource(o);
                    this.mapObjects.push(o);
                }
                console.log(all[i]);
            }
        }
    },
    timerFunction: function () {
        //foreach all mapObjects
        for (var k = 0; k < this.mapObjects.length; k++) {
            //if oldvalue another than current -> run modifications on objects.
            //element->scope
            var c = this.mapObjects[k];
            var oldValueOnElement = c.oldValueOnElement;
            var newValueOnElement = this.getMapObjectoldValueOnElement(c);
            if (oldValueOnElement != newValueOnElement) {
                //make magic here
            }
            //scope->element
            var oldValueOnResource = c.oldValueOnResource;
            var newValueOnResource = this.getMapObjectoldValueOnResource(c);
            if (oldValueOnResource != newValueOnResource) {
                //make magic here
            }
        }
    },
    timerRun: function () {
        setInterval(this.timerFunction(), 500);
    },
    getMapObjectoldValueOnElement: function (mo) {
        var o = null;
        if (mo.params.length > 0) {
            o = $(mo.element)[mo.method](mo.params[0]);
        } else {
            o = $(mo.element)[mo.method]();
        }
        return o;
    },
    getMapObjectoldValueOnResource: function (mo) {
        var text = mo.params[mo.params.length - 1];
        return eval("mo.scopeOwner." + text);
    },
};
