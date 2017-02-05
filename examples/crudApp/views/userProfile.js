var userprofile = new View("userprofile", function (scope, routeParams) {
    scope.user = dataRepository.getById(parseInt(routeParams.id));
    scope.moveBack = function () {
        viewManager.renderView('userlist', false);
    };
    scope.edit = function () {
        viewManager.renderView('userupdate', false, {
            id: scope.user.id
        });
    };
    scope.remove = function () {
        dataRepository.remove(scope.user.id);
        scope.moveBack();
    };
}, "userprofile.html", false);