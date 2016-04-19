'use strict';
var crypto = require('crypto');
var es = require('event-stream');
var path = require('path');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var strip = require('gulp-strip-comments');
    // urljoin = require("url-join"),
    // trumpet = require("trumpet"),
    // concat  = require("concat-stream");

var file = 'file-deps.json';
var map = {
	'file_name': {
		type: 'js',
		path: 'uri',
		deps: [
		]
	}
}

var getDeps = function (file) {
	var R = /angular\s*\.\s*module\s*\(\s*[\'\"]([\w\d_\.-]+)[\'\"]\s*,\s*\[([^\]]*)\]\s*\)/gm;

	var content = String(file.contents);
	var deps = [];
	var matchs;

	// var md5 = crypto.createHash('md5').update(content).digest('hex');

	//console.log(content);
	while(matchs = R.exec(content)){
		if(matchs.length){
			deps.push({
				id: matchs[1].trim(),
				// md5: md5,
				type: 'js',
				path: path.relative(file.base, file.path),
				deps: matchs[2].replace(/['"\r\n\s*]/g, '').split(',')
			})
		}
	}
	return deps;
}

var getDepsFiles = function (base) {
	return function getDepsFile(file, cb) {

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
	    	if(dep && dep.id){
	    		str.push(JSON.stringify(dep));
	    	}
	    });
		file.processedByTempDepsMap = true;

		if(str.length){
			file.contents = new Buffer(str.join('\n'));
			cb(null, file);
		}else{
			cb();
		}
		
	}
}

var depsMap = function ( base ) {
	return es.map(getDepsFiles(base));
} 

var depsReduce = function () {
	return es.map(function (file, cb) {
		var content = String(file.contents);
		var deps = content.split('\n');

		deps = deps.map(function (dep){
			return JSON.parse(dep);
		});
		
		var maps = {};
		var shim = {
			angular: 'xxx',
		}

		deps.forEach(function (item){
			if ( !maps[item.id] ){

				maps[item.id] = item;

				if (shim[item.id]) {
					maps[item.id]['path'] = shim[item.id];
				}

				delete item.id;
			}
		});

		maps = JSON.stringify(maps);

		file.contents = new Buffer(maps);

		cb(null, file);
	});
}

module.exports = function(filename, options) {
	var options = {

	}

	var filename = filename || "map.json"

	return es.pipeline(
		//strip(),
		depsMap(''),
		concat(filename),
		depsReduce()
	);
};