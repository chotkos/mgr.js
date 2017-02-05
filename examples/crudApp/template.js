var template = new Template(function (scope) {
    scope.moveHome = function () {
        viewManager.renderView('userlist', false);
    };
});