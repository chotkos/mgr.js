var userlist = new View("userlist", function (scope) {
    console.log("userlist");
    scope.users = dataRepository.getAll();
    scope.showProfile = function (id) {
        viewManager.renderView('userprofile', false, {
            id: id
        });
    };

    scope.createNew = function () {
        viewManager.renderView('usercreate', false);
    };


}, "userlist.html", true);

var userprofile = new View("userprofile", function (scope, routeParams) {
    scope.user = dataRepository.getById(parseInt(routeParams.id));
    scope.moveBack = function () {
        if (viewManager.lastViewName != null) {
            viewManager.moveBack();
        } else {
            viewManager.renderView('userlist', false);
        }
    };


}, "userprofile.html", false);
mgrStart();

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
}, "usercreate.html", false);
