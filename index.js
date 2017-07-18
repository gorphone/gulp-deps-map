'use strict';
var crypto = require('crypto');
var es = require('event-stream');
var path = require('path');
var strip = require('strip-comments');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
/**
 * {
    "alias": {
        "common/lib/node_modules/jquery/dist/jquery.js": "jquery",
        "common/lib/node_modules/angular/angular.js": "angular",
    },
    "shim": {
            "ui.select2": {
                "deps": [
                    "jquery.select2"
                ]
            }
        }
    }
 * @type {Object}
 */
var config = {};

var _unique_trim = function (array) {
    var n = []; // 临时数组
    var keys = {};
    for (var i = 0; i < array.length; i++) {
        if (array[i] && !keys[array[i]]) {
            n.push(array[i]);
            keys[array[i]] = true;
        }
    }
    return n;
};

var getDeps = function (file) {
    var relativePath = path.relative(file.base, file.path);
    var R = /@ng-map-deps:\s*\[([^\]]*)\]\s*/gm;
    var alias = config.alias || {};
    var shim = config.shim || {};

    var content = String(file.contents);
    var deps = [];
    var matchs;
    var comment_deps = [];
    var shim_deps = [];
    var _id;
    var _deps = [];

    var md5 = crypto.createHash('md5').update(content).digest('hex');

    matchs = R.exec(content);
    if (matchs && matchs.length) {
        comment_deps = matchs[1].replace(/['"\r\n\s*]/g, '').split(',');
    }

    if (alias[relativePath]) {
        _id = alias[relativePath];
        if (shim[_id]) {
            shim_deps = shim[_id].deps;
        }
        deps.push({
            id: _id,
            md5: md5,
            type: 'js',
            path: relativePath,
            deps: _unique_trim(_deps.concat(shim_deps).concat(comment_deps))
        });
    } else {
        try {
            var strip_content = strip(content); // 去掉注释，只分析代码里的依赖
            R = /(^|\W|\s)angular\s*\.\s*module\s*\(\s*['"]([\w\d_\.-]+)['"]\s*,\s*\[([^\]]*)\]\s*\)/gm;
            // angular的模块
            while ((matchs = R.exec(strip_content))) {
                if (matchs.length) {
                    _id = matchs[2].trim();
                    _deps = matchs[3].replace(/['"\r\n\s*]/g, '').split(',');
                    if (shim[_id]) {
                        shim_deps = shim[_id].deps;
                    }
                    deps.push({
                        id: _id,
                        md5: md5,
                        type: 'js',
                        path: relativePath,
                        deps: _unique_trim(_deps.concat(shim_deps).concat(comment_deps))
                    });
                }
            }
        } catch (e) {
            console.log(('[warn] gulp-deps-map file ignore:' + relativePath).yellow);
        }
    }

    return deps;
};

var getDepsFiles = function () {
    return function getDepsFile (file, cb) {
        if (file.processedByTempDepsMap) {
            return cb(null, file);
        }

        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new gutil.PluginError('gulp-deps-map', 'doesn\'t support Streams'));
        }

        var deps = getDeps(file);
        var str = [];

        deps.forEach(function (dep) {
            if (dep && dep.id) {
                str.push(JSON.stringify(dep));
            }
        });
        file.processedByTempDepsMap = true;

        if (str.length) {
            file.contents = new Buffer(str.join('\n'));
            cb(null, file);
        } else {
            cb();
        }
        return null;
    };
};

var depsMap = function () {
    return es.map(getDepsFiles());
};

var depsReduce = function () {
    return es.map(function (file, cb) {
        var content = String(file.contents);
        var deps = content.split('\n');

        deps = deps.map(function (dep) {
            return JSON.parse(dep);
        });
        // 去掉min文件重合的问题
        var depsCacheObj = {};

        deps.forEach(function (dep){
            if (depsCacheObj[dep.id] === undefined) {
                depsCacheObj[dep.id] = {
                    paths: [],
                    hasMinFile: false
                }
            } else if(depsCacheObj[dep.id].hasMinFile) {
                return;
            }

            depsCacheObj[dep.id].paths.push(dep.path);
            var requiredMinPath = dep.path.indexOf('.min.js') > -1 ? dep.path : dep.path.replace('.js', '.min.js');

            depsCacheObj[dep.id].paths.some(function(path){
                return path === requiredMinPath;
            }) && (depsCacheObj[dep.id].hasMinFile = true);
        });

        var maps = {};

        deps.forEach(function (item) {
            if (!maps[item.id] && (depsCacheObj[item.id].hasMinFile && item.path.indexOf('.min.js') > -1 || !depsCacheObj[item.id].hasMinFile)) {
                maps[item.id] = item;
                delete item.id;
            }
        });

        maps = JSON.stringify(maps, null, 4);

        file.contents = new Buffer(maps);

        cb(null, file);
        return null;
    });
};

module.exports = function (conf, filename) {
    if (conf) {
        config = conf;
    }

    var filename = filename || 'map.json';

    return es.pipeline(
        // strip(),
        depsMap(),
        concat(filename),
        depsReduce()
    );
};
