var directiveManager = {
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
