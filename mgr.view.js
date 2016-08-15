function View(name, init, template) {
    this.name = name;
    this.template = template;
    this.element = this.getTemplateContent()
    init = init;
    render = function () {
        init();
        //interpolate
    };
    this.getTemplateContent = function () {
        $.get("ajax/" + this.name, function (data) {
            this.element = data;
        });
    };

}

View.prototype.getName = function () {
    return this.name;
}