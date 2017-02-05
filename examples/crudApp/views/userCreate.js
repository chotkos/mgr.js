
var usercreate = new View("usercreate", function (scope) {
    scope.user = {
        id: 0,
        name: '',
        imageUrl: '',
        position: '',
        description: ''
    };

    scope.moveBack = function () {
        if (viewManager.lastViewName != null) {
            viewManager.moveBack();
        } else {
            viewManager.renderView('userlist', false);
        }
    };

    scope.save = function () {
        dataRepository.create(scope.user);
        scope.moveBack();
    };
}, "views/userCreate.html", false);