var simpleDir = new Directive("usersCounter", function (scope, args) {
    scope.text = "Users:" + args;
}, "usersCounter.html");
