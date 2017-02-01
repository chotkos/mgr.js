jQuery.extend({
    //return true if arrays are the same
    compareArrays: function (arrayA, arrayB) {
        if (arrayA.length != arrayB.length) {
            return false;
        }
        // sort modifies original array
        // (which are passed by reference to our method!)
        // so clone the arrays before sorting
        var a = jQuery.extend(true, [], arrayA);
        var b = jQuery.extend(true, [], arrayB);
        for (var i = 0, l = a.length; i < l; i++) {
            if (JSON.stringify(a) !== JSON.stringify(b)) {
                return false;
            }
        }
        return true;
    },
    queryStringToHash: function (query) {
        var query_string = {};
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            pair[0] = decodeURIComponent(pair[0]);
            pair[1] = decodeURIComponent(pair[1]);
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], pair[1]];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    }
});

String.prototype.replaceAll = function(search,replacement){
    var target = this;
    return target.split(search).join(replacement);
};var dictionaries = {
    errors: {},
    informations:{},
    warinings:{}
};

dictionaries.errors["viewLoadFail"] = function (name) {
    return "Failed to load view: " + name;
};
dictionaries.errors["noBackView"] = function () {
    return "There is no last view saved.";
};
dictionaries.errors["cannotResolveBinding"] = function () {
    return "Cannot resolve binding.";
};

dictionaries.informations["templateRendering"] = function(){
    return "Template rendering.";
};
dictionaries.informations["helloText"] = function(){
    return "mgr.js - let's graduate!";
};

"use strict";
//jQuery required
var binding = {
    mappedElements: [],
    mapObjects: [],
    directiveObjects: [],
    repeatElements: [],
    repeatObjects: [],
    renderElement: function (renderedElement, element, viewName) {

        //<a mgr-events="['click scope.moveBack()']">Back</a>
        if (renderedElement.attributes["mgr-events"]) {
            this.renderEvents(renderedElement,element);
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
    renderEvents: function (renderedElement,element) {
        var interpValues = eval(renderedElement.getAttribute("mgr-events"));
        for (var z = 0; z < interpValues.length; z++) {
            var split = interpValues[z].split(' ');
            var ind = interpValues[z].indexOf(' ');
            var fun = interpValues[z].substring(ind);
            fun = fun.replaceAll('scope', 'element.scope');

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


        var arr = [];
        for (var i in all) arr[i] = all[i];
        all = arr;
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
};var directiveManager = {
    container: {},
    getPromises: []
};


function Directive(name, init, template) {
    this.name = name;
    this.init = init;
    this.template = template;
    this.getTemplateContent = function (templateName, directiveName, context) {
        directiveManager.container[directiveName] = context;
        var get = $.get(templateName, function (data) {
            context.element = data;
            directiveManager.container[directiveName] = context;
        });
        get.viewName = directiveName;
        directiveManager.getPromises.push(get);
    };
    this.element = this.getTemplateContent(this.template, this.name, this);
}
var viewManager = {
    test: 'test',
    indexViewName: null,
    activeView: null,
    activeViewName: null,
    lastViewName: null,
    lastViewParams: null,
    activeScope: null,
    container: {},
    indexPromises: [],
    getPromises: [],
    mainUrl: window.location.href,
    renderView: function (name, keepUrl, paramsObject) {
        this.lastViewName = this.activeViewName;
        this.lastViewParams = paramsObject;
        if (this.container[name]) {
            this.activeView = this.container[name];
            var mainElement = $('#mgrapp');
            mainElement.html(this.activeView.element);
            mainElement.scope = {};
            this.activeScope = mainElement.scope;
            this.activeViewName = this.activeView.name;
            this.activeView.render(mainElement, mainElement.scope, keepUrl, paramsObject);
        } else {
            throw dictionaries.errors["viewLoadFail"](name);
        }
    },
    moveBack: function () {
        if (this.lastViewName) {
            this.renderView(this.lastViewName, false, this.lastViewParams);
        } else {
            console.warn(dictionaries.errors["noBackView"]());
        }
    },
    getMainUrl: function () {
        var index = window.location.href.lastIndexOf('#');
        if (index != -1) {
            this.mainUrl = window.location.href.substr(0, index);
        } else {
            this.mainUrl = window.location.href;
        }
    },
};

document.onmouseover = function () {
    window.docClick = true;
}

document.onmouseleave = function () {
    window.docClick = false;
}

window.onhashchange = function () {
    if (!window.docClick) {
        viewManager.moveBack();
    }
}
$(function () {
    //Allows to use backpace button
    var rx = /INPUT|SELECT|TEXTAREA/i;

    $(document).bind("keydown keypress", function (e) {
        if (e.which == 8) { // 8 == backspace
            if (!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly) {
                e.preventDefault();
                viewManager.moveBack();
            }
        }
    });
});



function View(name, init, template, isIndex) {
    this.name = name;
    this.template = template;
    this.isIndex = isIndex;
    this.init = init;
    this.render = function (mainElement, scope, keepUrl, paramsObject) {
        init(scope, paramsObject);
        var res = mainElement[0];
        res.scope = mainElement.scope;
        if (!keepUrl) {
            var href = viewManager.mainUrl + '#' + this.name;

            if (paramsObject != null && paramsObject != undefined) {
                href += '?' + $.param(paramsObject);
            }
            window.location.href = href;
        }
        binding.render(res, this.name);
    };
    this.getTemplateContent = function (templatename, viewname, context) {
        viewManager.container[viewname] = context;
        var get = $.get(templatename, function (data) {
            context.element = data;
            viewManager.container[viewname] = context;
            if (isIndex) {
                viewManager.indexViewName = name;
            }
        });
        get.viewName = viewname;
        viewManager.getPromises.push(get);
        if (isIndex)
            viewManager.indexPromises.push(get);
    };
    this.element = this.getTemplateContent(this.template, this.name, this);
}

function Template(init) {
    this.init = init;
    var scope = {};
    init(scope);

    var doc = $(document.body)[0];
    doc.scope = scope;
    binding.render(doc, 'template');
}

View.prototype.getName = function () {
    return this.name;
};

var mgrStart = function () {

    var load = function () {

        $.when.apply($, viewManager.indexPromises).then(function () {
            $.when.apply($, directiveManager.getPromises).then(function () {
                console.log(dictionaries.informations["helloText"]());
                viewManager.getMainUrl();
                var urlParams = null;
                if (window.location.href.lastIndexOf('#') != -1) {
                    var viewName = window.location.href.split('#');
                    viewName = viewName[viewName.length - 1];

                    if (viewName.indexOf('?') != -1) {
                        var vs = viewName.split('?');
                        viewName = vs[0];

                        urlParams = jQuery.queryStringToHash(vs[1]);
                    }

                    if (viewManager.container[viewName] != undefined) {
                        viewManager.renderView(viewName, true, urlParams);
                    }
                } else if (viewManager.indexViewName != null) {
                    viewManager.renderView(viewManager.indexViewName, false, urlParams);
                }
            });
        });
    };

    if (window.location.href.lastIndexOf('#') != -1) {
        var viewName = window.location.href.split('#');
        viewName = viewName[viewName.length - 1];

        if (viewName.indexOf('?') != -1) {
            var vs = viewName.split('?');
            viewName = vs[0];
        }
        for (var i = 0; i < viewManager.getPromises.length; i++) {
            var e = viewManager.getPromises[i];
            if (e.viewName === viewName) {
                viewManager.indexPromises = [e];
            }
        }
        load();
    } else load();



};
