var userlist = new View("userlist", function (scope) {
    console.log("userlist");
    scope.users = dataRepository.getAll();
    scope.showProfile = function(id){
        //viewManager.renderView('userprofile',false,{id:id});
        alert();
    };
}, "userlist.html", true);

var userprofile = new View("userprofile", function (scope, routeParams) {
    console.log("userprofile");
}, "userprofile.html", false);
mgrStart();