var userupdate = new View("userupdate", function (scope, routeParams) {
    scope.user = dataRepository.getById(routeParams.id);

    scope.moveBack = function () {
        if (viewManager.lastViewName != null) {
            viewManager.moveBack();
        } else {
            viewManager.renderView('userlist', false);
        }
    };

    scope.save = function () {
        dataRepository.update(scope.user);
        scope.moveBack();
    };
}, "userupdate.html", false);
