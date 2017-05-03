var gulp = require('gulp');

var cleanCss = require('gulp-clean-css');
var sass = require('gulp-sass');


function assets(path) {
    return 'app/assets/' + path;
}

gulp.task('scss', () => {
    gulp.src(assets('scss/base.scss'))
        .pipe(sass())
        .pipe(cleanCss())
        .pipe(gulp.dest(assets('scss')));
});

gulp.task('default', ['scss']);