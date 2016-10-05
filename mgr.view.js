var viewManager = {
    test: 'test',
    activeView: null,
    activeViewName:null,
    lastViewName: null,
    activeScope: null,
    container: {},
    renderView: function (name) {
        this.lastViewName = this.activeViewName;
        if (this.container[name]) {
            this.activeView = this.container[name];
            var mainElement = $('#mgrapp');
            mainElement.html(this.activeView.element);
            mainElement.scope = {};
            this.activeScope = mainElement.scope;
            this.activeViewName = this.activeView.name;
            this.activeView.render(mainElement, mainElement.scope);
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
};


function View(name, init, template) {
    this.name = name;
    this.template = template;
    this.init = init;
    this.render = function (mainElement, scope) {
        init(scope);
        var res = mainElement[0];
        res.scope = mainElement.scope;
        interpolate.render(res);
    };
    this.getTemplateContent = function (templatename, viewname, context) {
        $.get(templatename, function (data) {
            context.element = data;
            viewManager.container[viewname] = context;
        });
    };
    this.element = this.getTemplateContent(this.template, this.name, this);
}

View.prototype.getName = function () {
    return this.name;
};
