SET FileToDelete="mgr.full.js"
IF EXIST %FileToDelete% del /F %FileToDelete%

type mgr.extends.js >> mgr.full.js
type mgr.dictionaries.js >> mgr.full.js
type mgr.binding.js >> mgr.full.js
type mgr.directive.js >> mgr.full.js
type mgr.view.js >> mgr.full.js
