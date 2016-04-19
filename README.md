# gulp-deps-map

To install:
```
npm install gulp-deps-map --save
```

usage:

```
var gulpDepsMaps = require('gulp-deps-map');
var filter = require('gulp-filter');

var isAdded = function (file) {
    return file.event === 'add';
};
var filterAdded = filter(isAdded);

gulp.src('./src/**/*.js')
    .pipe(watch('./src/**/*.js'))
    .pipe(filterAdded)
    .pipe(gulpDepsMaps())
    .pipe(gulp.dest('./public/src/'));
```

use gulp-deps-loader to load dependences
