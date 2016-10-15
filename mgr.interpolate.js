"use strict";
//jQuery required
var interpolate = {
    mappedElements: [],
    mapObjects: [],
    directiveObjects: [],
    repeatElements: [],
    repeatObjects: [],
    renderElement: function (obj, mainElement) {
        var all = [obj];
        var element = mainElement;
        var i = 0; //TODO REFACTOR
        //<div mgr-repeat="item in scope.items">
        if (all[i].attributes["mgr-repeat"]) {

            var interpValues = all[i].getAttribute("mgr-repeat").split(" ");
            var alias = interpValues[0];
            var collectionName = interpValues[2];
            var collectionData = eval(collectionName.replaceAll('scope', 'element.scope'));
            var template = all[i];
            var tplHtml = $(all[i]).html();
            var parent = all[i].parentNode;

            //mark template elements to not map
            var toMark = template.getElementsByTagName("*");
            for (var zi = 0; zi < toMark.length; zi++) {
                $(toMark[zi]).attr('isTemplate', 'true');
            };

            template.hidden = true;

            for (var k = 0; k < collectionData.length; k++) {
                var e = document.createElement(template.tagName);
                $(e).html(tplHtml);
                e.scope = collectionData[k];
                $(e).html($(e).html().replaceAll(alias, collectionName + '[' + k + ']'));
                $(parent).append(e);
                var all = [];
                all.push.apply(all, e.getElementsByTagName("*"));
                for (var ww = 0; ww < all.length; ww++) {
                    this.renderElement(all[ww], element);
                }
            }

            this.repeatObjects.push({
                element: obj,
                data: collectionData,
                renderElement: element,
                collectionName: collectionName.replaceAll('scope', 'element.scope'),
            });

        } else
        //<div mgr="['css color scope.color', 'text scope.name']"></div>
        if (all[i].attributes["mgr"] && !all[i].hasAttribute("istemplate")) {
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
                            var p1 = this.params[0] ? this.params[0].replaceAll('scope.', 'this.scopeOwner.scope.') : '';
                            var p2 = this.params[1] ? this.params[1].replaceAll('scope.', 'this.scopeOwner.scope.') : '';
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
                    if (this === null) {
                        context.mapObjects.push(o);
                    } else {
                        this.mapObjects.push(o);
                    }
                }
            }
        } else
        //<div mgr-dir="mydir scopefieldname">
        if (all[i].attributes["mgr-dir"]) {
            context.renderDirective(all[i],this);
        }
    },
    renderDirective : function(directiveElement,context){
        //split data from attribute

        //find directive definition
        //render all[i] as the directive
        //connect scopes by scopefieldname
        //push to directiveobjects
    },
    render: function (element) {
        var all = element.getElementsByTagName("*");
        var arr = [];
        for (var i in all) arr[i] = all[i];
        all = arr;
        for (var i = 0; i < all.length; i++) {
            this.renderElement(all[i], element);
        }
        this.timerRun();
    },
    timerFunction: function (context) {
        for (var z = 0; z < context.repeatObjects.length; z++) {
            var ro = context.repeatObjects[z];

            var element = ro.renderElement;
            var newValues = eval(ro.collectionName);

            if (!jQuery.compareArrays(ro.data, newValues)) {
                var template = $(ro.element).html();

                while (ro.element.parentElement.children[1] != undefined) {
                    ro.element.parentElement.children[1].remove();
                }

                var interpValues = ro.element.getAttribute("mgr-repeat").split(" ");
                var alias = interpValues[0];
                var collectionName = interpValues[2];
                var collectionData = eval(collectionName.replaceAll('scope', 'element.scope'));
                var template = ro.element;
                var tplHtml = $(ro.element).html();
                var parent = ro.element.parentNode;

                //mark template elements to not map
                var toMark = template.getElementsByTagName("*");
                for (var zi = 0; zi < toMark.length; zi++) {
                    $(toMark[zi]).attr('isTemplate', 'true');
                };

                template.hidden = true;
                tplHtml = tplHtml.replaceAll(/istemplate="true"/g, '');
                for (var k = 0; k < collectionData.length; k++) {
                    var e = document.createElement(template.tagName);
                    $(e).html(tplHtml);
                    e.scope = collectionData[k];
                    $(e).html($(e).html().replaceAll(alias, collectionName + '[' + k + ']'));
                    $(parent).append(e);
                    var all = [];
                    all.push.apply(all, e.getElementsByTagName("*"));
                    for (var ww = 0; ww < all.length; ww++) {
                        context.renderElement(all[ww], ro.renderElement);
                    }
                }
                ro.data = newValues;
            }
        }
        var newMO = [];
        for (var ki = 0; ki < context.mapObjects.length; ki++) {
            if (document.contains(context.mapObjects[ki].element)) {
                newMO.push(context.mapObjects[ki]);
            }
        }
        context.mapObjects = newMO;

        for (var k = 0; k < context.mapObjects.length; k++) {
            //element->scope
            var c = context.mapObjects[k];
            if (!c.element.hasAttribute('istemplate')) {
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
        try {
            var text = mo.params[mo.params.length - 1];
            return eval("mo.scopeOwner." + text);
        } catch (e) {
            console.log('cannot resolve');
        }
    },
};
