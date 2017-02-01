var dictionaries = {
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

