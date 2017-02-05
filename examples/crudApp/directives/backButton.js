var backButtonDir = new Directive("backButton",function(scope,args){

    scope.moveBack = function () {
        if (viewManager.lastViewName != null) {
            viewManager.moveBack();
        } else {
            viewManager.renderView('userlist', false);
        }
    };
}, "directives/backButton.html");