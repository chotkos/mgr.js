var directiveManager = {
    container: {},
    getPromises: [],
};


function Directive(name, init, template) {
    this.name = name;
    this.init = init;
    this.template = template;
    this.getTemplateContent = function (templatename, directivename, context) {
        directiveManager.container[directivename] = context;
        var get = $.get(templatename, function (data) {
            context.element = data;
            directiveManager.container[directivename] = context;
        });
        get.viewName = directivename;
        directiveManager.getPromises.push(get);
    };
    this.element = this.getTemplateContent(this.template, this.name, this);
}
