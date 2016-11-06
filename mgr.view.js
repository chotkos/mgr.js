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
    /*
     * this swallows backspace keys on any non-input element.
     * stops backspace -> back
     */
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
        interpolate.render(res, this.name);
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
    interpolate.render(doc, 'template');
}

View.prototype.getName = function () {
    return this.name;
};

var mgrStart = function () {

    var load = function () {

        $.when.apply($, viewManager.indexPromises).then(function () {
            console.log("mgr.js - let's graduate!");
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