"use strict";
//jQuery required
var interpolate = {
    mappedElements: [],
    mapObjects: [],
    directiveObjects: [],
    repeatElements: [],
    render: function (element) {
        var all = element.getElementsByTagName("*");
        var arr = [];
        for (var i in all) arr[i] = all[i];
        all = arr;
        for (var i = 0; i < all.length; i++) {
            //<div mgr-repeat="item in scope.items">
            if (all[i].attributes["mgr-repeat"]) {
                this.repeatElements.push(all[i]);
                var interpValues = all[i].getAttribute("mgr-repeat").split(" ");
                var alias = interpValues[0];
                var collectionName = interpValues[2];
                var collectionData = eval(collectionName.replace('scope', 'element.scope'));
                var template = all[i];
                template.removeAttribute("mgr-repeat");
                var tplHtml = $(all[i]).html();
                var parent = all[i].parentNode;
                parent.innerHTML = "";
                template.remove();
                for (var k = 0; k < collectionData.length; k++) {
                    var e = document.createElement("div");
                    $(e).html(tplHtml);
                    e.scope = collectionData[k];
                    $(e).html($(e).html().replace(alias, collectionName + '[' + k + ']'));
                    $(parent).append(e);
                    all.push.apply(all, e.getElementsByTagName("*"));
                }
                all[i].remove();
            } else
            //<div mgr="['css color scope.color', 'text scope.name']"></div>
            if (all[i].attributes["mgr"]) {
                if (jQuery.contains(document, all[i])) {
                    this.mappedElements.push(all[i]);
                    var interpKeys = eval(all[i].getAttribute("mgr"));
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
                                var p1 = this.params[0] ? this.params[0].replace('scope.', 'this.scopeOwner.scope.') : '';
                                var p2 = this.params[1] ? this.params[1].replace('scope.', 'this.scopeOwner.scope.') : '';
                                if (p1.indexOf('scope') != -1) {
                                    p1 = eval(p1);
                                }
                                if (p2.indexOf('scope') != -1) {
                                    p2 = eval(p2);
                                }

                                eval("$(this.element)[this.method](p1,p2)");
                            },
                            mapFromElement: function () {
                                var field = null;
                                var value = null;
                                if (this.params.length > 1) {
                                    field = "this.scopeOwner." + this.params[1];
                                    value = "$(this.element)[this.method](this.params[0])";
                                } else {
                                    field = "this.scopeOwner." + this.params[0];
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
            } else
            //<div mgr-dir="mydir scopefieldname">
            if (all[i].attributes["mgr-dir"]) {
                //split data from attribute
                //find directive definition
                //render all[i] as the directive 
                //connect scopes by scopefieldname
                //push to directiveobjects
            }
        }
        this.timerRun();
    },
    timerFunction: function (context) {
        for (var k = 0; k < context.mapObjects.length; k++) {
            //element->scope
            var c = context.mapObjects[k];
            var oldValueOnElement = c.oldValueOnElement;
            var newValueOnElement = context.getMapObjectoldValueOnElement(c);
            if (oldValueOnElement != newValueOnElement) {
                //make magic here
                c.mapFromElement(context);
                c.oldValueOnElement = context.getMapObjectoldValueOnElement(c);
            }
            //scope->element
            var oldValueOnResource = c.oldValueOnResource;
            var newValueOnResource = context.getMapObjectoldValueOnResource(c);
            if (oldValueOnResource != newValueOnResource) {
                //make magic here
                c.mapFromResource(context);
                c.oldValueOnResource = context.getMapObjectoldValueOnResource(c);
                c.oldValueOnElement = oldValueOnResource;
            }
        }
    },
    timerRun: function () {
        setInterval(this.timerFunction.bind(null, this), 500);
    },
    getMapObjectoldValueOnElement: function (mo) {
        var o = null;
        if (mo.params.length > 1) {
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
