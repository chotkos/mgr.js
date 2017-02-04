"use strict";
//jQuery required
var binding = {
    mappedElements: [],
    mapObjects: [],
    directiveObjects: [],
    repeatElements: [],
    repeatObjects: [],
    renderElement: function (renderedElement, element, viewName) {
        if (renderedElement!=null) {
            //<a mgr-events="['click scope.moveBack()']">Back</a>
            if (renderedElement.attributes["mgr-events"]) {
                this.renderEvents(renderedElement, element);
            }
            //<div mgr-repeat="item in scope.items">
            if (renderedElement.attributes["mgr-repeat"]) {
                this.renderRepeat(renderedElement, element, viewName);
            } else
            //<div mgr="['css color scope.color', 'text scope.name']"></div>
            if (renderedElement.attributes["mgr"] && !renderedElement.hasAttribute("istemplate")) {
                this.renderProperties(renderedElement, viewName, element);
            } else
            //<div mgr-dir="mydir scopefieldname">
            if (renderedElement.attributes["mgr-dir"]) {
                this.renderDirective(renderedElement, this, element, viewName);
            }
        }else{
            throw dictionaries.errors["cannotRenderElement"]();
        }
    },
    renderRepeat: function (renderedElement, element, viewName) {
        var interpValues = renderedElement.getAttribute("mgr-repeat").split(" ");
        var alias = interpValues[0];
        var collectionName = interpValues[2];
        var collectionData = JSON.parse(JSON.stringify(eval(collectionName.replaceAll('scope', 'element.scope'))));
        var template = renderedElement;
        var tplHtml = $(renderedElement).html();
        var parent = renderedElement.parentNode;

        //mark template elements to not map
        var toMark = template.getElementsByTagName("*");
        for (var zi = 0; zi < toMark.length; zi++) {
            $(toMark[zi]).attr('isTemplate', 'true');
        }

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
                this.renderElement(all[ww], element, viewName);
            }
        }

        this.repeatObjects.push({
            viewName: viewName,
            element: renderedElement,
            data: collectionData,
            renderElement: element,
            collectionName: collectionName.replaceAll('scope', 'element.scope'),
        });
    },
    renderProperties: function (renderedElement, viewName, element) {
        if (jQuery.contains(document, renderedElement)) {
            this.mappedElements.push(renderedElement);
            var interpKeys = eval(renderedElement.getAttribute("mgr"));
            for (var l = 0; l < interpKeys.length; l++) {
                var interpKey = interpKeys[l];
                var splitArray = interpKey.split(' ');
                var method = splitArray[0];
                splitArray.shift();
                var params = splitArray;
                var o = {
                    viewName: viewName,
                    element: renderedElement,
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
                o.oldValueOnElement = this.getMapObjectOldValueOnElement(o);
                o.oldValueOnResource = this.getMapObjectOldValueOnResource(o);
                if (this === null) {
                    this.mapObjects.push(o);
                } else {
                    this.mapObjects.push(o);
                }
            }
        }
    },
    renderEvents: function (renderedElement, element) {
        var interpValues = eval(renderedElement.getAttribute("mgr-events"));
        for (var z = 0; z < interpValues.length; z++) {
            var split = interpValues[z].split(' ');
            var ind = interpValues[z].indexOf(' ');
            var fun = interpValues[z].substring(ind);
            fun = fun.replaceAll('scope', 'element.scope');

            $(renderedElement).off(split[0]);
            $(renderedElement).on(split[0], function () {
                eval(fun);
            });
        }
    },
    renderDirective: function (directiveElement, context, mainElement, viewName) {
        //split data from attribute
        var atr = directiveElement.getAttribute("mgr-dir");
        var argtable = atr.split(' ');
        var directiveName = argtable[0].trim();
        var directiveScope = atr.substr(directiveName.length, atr.length - 1).trim();
        argtable = [directiveName, directiveScope];

        var directive = directiveManager.container[directiveName];
        //render directiveElement as the directive
        if (argtable.length > 1) {
            $(directiveElement).html(directive.element.replaceAll('scope', argtable[1]));
        }

        var all = directiveElement.getElementsByTagName("*");
        for (var ww = 0; ww < all.length; ww++) {
            this.renderElement(all[ww], mainElement, viewName);
        }

        var dirArgs = argtable[1].replaceAll('scope.', 'element.scope.')
        var dirObject = {
            directiveDefinition: directive,
            element: directiveElement,
            renderElement: mainElement,
            viewName: viewName,
            name: directiveName,
            directiveArgs: dirArgs,
            parent: directiveElement.parentNode

        };
        this.directiveObjects.push(dirObject);
    },
    render: function (element, viewName) {
        var all = element.getElementsByTagName("*");

        if (viewName == 'template') {
            console.log(dictionaries.informations["templateRendering"]());
        }

        for (var i = 0; i < all.length; i++) {
            this.renderElement(all[i], element, viewName);
        }
        this.timerRun();
    },
    timerFunction: function (context) {
        for (var z = 0; z < context.repeatObjects.length; z++) {
            var ro = context.repeatObjects[z];
            if (ro.viewName === viewManager.activeViewName) {
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
                    }
                    ;

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
                            context.renderElement(all[ww], ro.renderElement, ro.viewName);
                        }
                    }
                    ro.data = JSON.parse(JSON.stringify(newValues));
                }
            }
        }
        var newMO = [];
        for (var ki = 0; ki < context.mapObjects.length; ki++) {
            if (context.mapObjects[ki].viewName == viewManager.activeViewName &&
                document.contains(context.mapObjects[ki].element)) {
                newMO.push(context.mapObjects[ki]);
            }
        }
        context.mapObjects = newMO;

        for (var k = 0; k < context.mapObjects.length; k++) {
            //element->scope
            var c = context.mapObjects[k];
            if (!c.element.hasAttribute('istemplate')) {
                var oldValueOnElement = c.oldValueOnElement;
                var newValueOnElement = context.getMapObjectOldValueOnElement(c);
                if (oldValueOnElement != newValueOnElement) {
                    c.mapFromElement(context);
                    c.oldValueOnElement = context.getMapObjectOldValueOnElement(c);
                }
                //scope->element
                var oldValueOnResource = c.oldValueOnResource;
                var newValueOnResource = context.getMapObjectOldValueOnResource(c);
                if (oldValueOnResource != newValueOnResource) {
                    c.mapFromResource(context);
                    c.oldValueOnResource = context.getMapObjectOldValueOnResource(c);
                    c.oldValueOnElement = oldValueOnResource;
                }
            }
        }
    },
    timerRun: function () {
        setInterval(this.timerFunction.bind(null, this), 500);
    },
    getMapObjectOldValueOnElement: function (mo) {
        var o = null;
        if (mo.params.length > 1) {
            o = $(mo.element)[mo.method](mo.params[0]);
        } else {
            o = $(mo.element)[mo.method]();
        }
        return o;
    },
    getMapObjectOldValueOnResource: function (mo) {
        try {
            var text = mo.params[mo.params.length - 1];
            return eval("mo.scopeOwner." + text);
        } catch (e) {
            throw dictionaries.errors["cannotResolveBinding"]();
        }
    },
};