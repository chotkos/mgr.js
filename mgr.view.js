var viewManager = {
    test: 'test',
    indexViewName: null,
    activeView: null,
    activeViewName: null,
    lastViewName: null,
    activeScope: null,
    container: {},
    mainUrl: window.location.href,
    renderView: function (name, keepUrl) {
        this.lastViewName = this.activeViewName;
        if (this.container[name]) {
            this.activeView = this.container[name];
            var mainElement = $('#mgrapp');
            mainElement.html(this.activeView.element);
            mainElement.scope = {};
            this.activeScope = mainElement.scope;
            this.activeViewName = this.activeView.name;
            this.activeView.render(mainElement, mainElement.scope, keepUrl);
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
    this.render = function (mainElement, scope, keepUrl) {
        init(scope);
        var res = mainElement[0];
        res.scope = mainElement.scope;
        if (!keepUrl) {
            window.location.href = viewManager.mainUrl + '#' + this.name;
        }
        interpolate.render(res);
    };
    this.getTemplateContent = function (templatename, viewname, context) {
        $.get(templatename, function (data) {
            context.element = data;
            viewManager.container[viewname] = context;
            if (isIndex) {
                viewManager.indexViewName = name;
            }
        });
    };
    this.element = this.getTemplateContent(this.template, this.name, this);
}

View.prototype.getName = function () {
    return this.name;
};

$(document).ready(function () {
    console.log("mgr.js - let's graduate!");
    viewManager.getMainUrl();
    if (window.location.href.lastIndexOf('#') != -1) {
        var viewName = window.location.href.split('#');
        viewName = viewName[viewName.length - 1];
        if (viewManager.container[viewName] != undefined) {
            viewManager.renderView(viewName, true);
        }
    } else
    if (viewManager.indexViewName != null) {
        viewManager.renderView(viewManager.indexViewName, false);
    }
});