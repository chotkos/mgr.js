var viewManager = {
    test: 'test',
    container: {},
};


function View(name, init, template) {
    this.name = name;
    this.template = template,
        init = init;
    render = function () {
        init();
        //interpolate()
    };
    this.getTemplateContent = function (templatename, viewname,context) {
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
