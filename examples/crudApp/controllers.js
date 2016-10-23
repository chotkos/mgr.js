var userlist = new View("userlist", function (scope) {    console.log("userlist");
    scope.users = dataRepository.getAll();
    scope.showProfile = function(id){
        viewManager.renderView('userprofile',false,{id:id});
        //alert(id);
    };


}, "userlist.html", true);

var userprofile = new View("userprofile", function (scope, routeParams) {
    console.log("userprofile");
    console.log(routeParams);
    scope.user = dataRepository.getById(parseInt(routeParams.id));
    scope.moveBack = function(){
        if(viewManager.lastViewName != null){
            viewManager.moveBack();
        }else{
            viewManager.renderView('userlist',false);
        }
    };
}, "userprofile.html", false);
mgrStart();