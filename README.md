a plugin to analysis the dependance of angular module, the ouput is a json like this:
```
{
    "flow.provider": {
        "md5": "ff57bcde125f45a9402010f0078baecb",
        "type": "js",
        "path": "common/lib/node_modules/ng-flow/dist/ng-flow-provider.js",
        "deps": []
    },
    "flow.init": {
        "md5": "ff57bcde125f45a9402010f0078baecb",
        "type": "js",
        "path": "common/lib/node_modules/ng-flow/dist/ng-flow-init.js",
        "deps": [
            "flow.provider"
        ]
    },
    "flow.btn": {
        "md5": "ff57bcde125f45a9402010f0078baecb",
        "type": "js",
        "path": "common/lib/node_modules/ng-flow/dist/ng-flow-btn.js",
        "deps": [
            "flow.init"
        ]
    },
    "flow.dragEvents": {
        "md5": "ff57bcde125f45a9402010f0078baecb",
        "type": "js",
        "path": "common/lib/node_modules/ng-flow/dist/ng-flow-dragevents.js",
        "deps": [
            "flow.init"
        ]
    },
    "flow.drop": {
        "md5": "ff57bcde125f45a9402010f0078baecb",
        "type": "js",
        "path": "common/lib/node_modules/ng-flow/dist/ng-flow-drop.js",
        "deps": [
            "flow.init"
        ]
    },
    "flow.events": {
        "md5": "ff57bcde125f45a9402010f0078baecb",
        "type": "js",
        "path": "common/lib/node_modules/ng-flow/dist/ng-flow-events.js",
        "deps": [
            "flow.init"
        ]
    },
    "flow.img": {
        "md5": "ff57bcde125f45a9402010f0078baecb",
        "type": "js",
        "path": "common/lib/node_modules/ng-flow/dist/ng-flow-img.js",
        "deps": [
            "flow.init"
        ]
    },
    "flow.transfers": {
        "md5": "ff57bcde125f45a9402010f0078baecb",
        "type": "js",
        "path": "common/lib/node_modules/ng-flow/dist/ng-flow-transfers.js",
        "deps": [
            "flow.init"
        ]
    },
    "flow": {
        "md5": "ff57bcde125f45a9402010f0078baecb",
        "type": "js",
        "path": "common/lib/node_modules/ng-flow/dist/ng-flow-standalone.js",
        "deps": [
            "flow.provider",
            "flow.init",
            "flow.events",
            "flow.btn",
            "flow.drop",
            "flow.transfers",
            "flow.img",
            "flow.dragEvents"
        ]
    }
```
To do so, you can manage or load you js file in project of angular as you like.

To install:
```
npm install gulp-deps-map --save
```

usage:
```
var gulpDepsMaps = require('gulp-deps-map');
var config = {
	 "alias": {
        "common/lib/node_modules/jquery/dist/jquery.js": "jquery",
        "common/lib/node_modules/angular/angular.js": "angular",
        "common/lib/node_modules/bootstrap/dist/js/bootstrap.js": "bootstrap",
        "common/lib/no_npm/ht-form-validition/src/validator.js": "validator",
        "common/lib/no_npm/ht-form-validition/src/jquery.validator.js": "jquery.validator",
        "common/lib/no_npm/select2/select2.js": "jquery.select2",
        "common/lib/no_npm/jquery.panzoom/dist/jquery.panzoom.js": "jquery.panzoom",
        "common/lib/no_npm/jQuery.dragmove/jQuery.dragmove.js": "jquery.dragmove",
        "common/lib/no_npm/resizeThis/resizeThis.js": "resizeThis"
    },
    "shim": {
        "ui.select2": {
            "deps": [
                "jquery.select2"
            ]
        },
        "ng-light-box" : {
            "deps": [
                "jquery",
                "jquery.panzoom", 
                "jquery.dragmove", 
                "jquery.mousewheel", 
                "resizeThis"
            ]
        }
    }
}
 
gulp.src('./src/**/*.js')
    .pipe(watch('./src/**/*.js'))
    .pipe(filterAdded)
    .pipe(gulpDepsMaps(config))
    .pipe(gulp.dest('./public/src/'));
```

the other files which are writed in angular can be managed by `alias` and `shim` in config 

use `gulp-deps-loader` to load dependences
