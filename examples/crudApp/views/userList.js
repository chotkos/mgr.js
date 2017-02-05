var userlist = new View("userlist", function (scope) {
    scope.users = dataRepository.getAll();
    scope.showProfile = function (id) {
        viewManager.renderView('userprofile', false, {
            id: id
        });
    };

    scope.createNew = function () {
        viewManager.renderView('usercreate', false);
    };
}, "views/userList.html", true);