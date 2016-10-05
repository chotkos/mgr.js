var dictionaries = {
    errors: {},
};

dictionaries.errors["viewLoadFail"] = function (name) {
    return "Failed to load view: " + name;
};
dictionaries.errors["noBackView"] = function () {
    return "There is no last view saved.";
};

