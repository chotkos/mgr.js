var viewManager = {
    test: 'test',
    indexViewName: null,
    activeView: null,
    activeViewName: null,
    lastViewName: null,
    activeScope: null,
    container: {},
    getPromises: [],
    mainUrl: window.location.href,
    renderView: function (name, keepUrl, paramsObject) {
        this.lastViewName = this.activeViewName;
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
            this.renderView(this.lastViewName);
        } else {
            throw dictionaries.errors["noBackView"]();
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
        interpolate.render(res);
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

        viewManager.getPromises.push(get);
    };
    this.element = this.getTemplateContent(this.template, this.name, this);
}

View.prototype.getName = function () {
    return this.name;
};

var mgrStart = function () {

    $.when.apply($, viewManager.getPromises).then(function () {
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