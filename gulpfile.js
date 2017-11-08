var gulp = require('gulp');

var cleanCss = require('gulp-clean-css');
var filter = require('gulp-filter');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

var fs = require('fs');


var path = {
    scss: 'app/assets/scss/'
};

// ---------- DEV TASKS ----------
/**
 * Compile base.scss into
 * -> base.css
 * -> base.css.map
 * -> base.min.css
 */
gulp.task('scss', function () {
    return gulp.src(path.scss + 'base.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(path.scss))
        // minify
        .pipe(filter('**/*.css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.scss));
});

gulp.task('scss:watch', ['scss'], function () {
    return gulp.watch(path.scss + '/**/*.scss', ['scss']);
});
gulp.task('dev', ['scss:watch']);


gulp.task('build', ['scss']);
gulp.task('default', ['build']);
