var userlist = new View("userlist", function (scope) {
    console.log("userlist");
}, "userlist.html", true);

var userprofile = new View("userprofile", function (scope, routeParams) {
    console.log("userprofile");
}, "userprofile.html", false);
mgrStart();