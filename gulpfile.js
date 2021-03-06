const gulp = require('gulp');

const babel = require('gulp-babel');
const concat = require('gulp-concat');
const cleanCss = require('gulp-clean-css');
const filter = require('gulp-filter');
const htmlmin = require('gulp-htmlmin');
const htmlReplace = require('gulp-html-replace');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const sass = require("gulp-sass");
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const fs = require('fs');

const path = {
    app: 'app',
    assets: 'app/assets',
    scss: 'app/assets/scss',
    server: 'server',
    dist: 'dist',
    distApp: 'dist/app',
    distServer: 'dist/server'
};

// ---------- DEV TASKS ----------
/**
 * Compile base.scss into
 * -> base.css
 * -> base.css.map
 * -> base.min.css
 */
gulp.task('scss', () => {
    return gulp.src(path.scss + '/base.scss')
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

gulp.task('scss:watch', ['scss'], () => {
    return gulp.watch(path.scss + '/**/*.scss', ['scss']);
});

// ---------- BUILD TASKS ----------

gulp.task('htmlTemplates', () => {
    return gulp.src([path.app + '/**/*.html', `!${path.app}/index.html`])
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(path.distApp));
});

gulp.task('htmlTemplates:watch', ['htmlTemplates'], () => {
    return gulp.watch([path.app + '/**/*.html', `!${path.app}/index.html`], ['htmlTemplates']);
});

gulp.task('htmlIndex', () => {
    return gulp.src(path.app + '/index.html')
        .pipe(htmlReplace({
            'css': ['assets/css/app.min.css',
                '<link rel="stylesheet" ref="https://fonts.googleapis.com/icon?family=Material+Icons">'
            ],
            'js-lib': [
                'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js',
                'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-route.min.js',
                'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-resource.min.js'
            ],
            'js-app': 'assets/js/app.min.js'
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(path.distApp));
});

gulp.task('htmlIndex:watch', ['htmlIndex'], () => {
    return gulp.watch(path.app + '/index.html', ['htmlIndex']);
});

gulp.task('icon', () => {
    return gulp.src(path.assets + '/material-icons/*')
        .pipe(gulp.dest(path.distApp + '/assets/material-icons'))
});

gulp.task('css', ['scss', 'icon'], () => {
    return gulp.src(path.assets + '/scss/base.css')
        .pipe(rename('app.css'))
        .pipe(gulp.dest(path.distApp + '/assets/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCss())
        .pipe(gulp.dest(path.distApp + '/assets/css'))
});

gulp.task('css:watch', ['css'], () => {
    return gulp.watch(path.assets + '/scss/base.css', ['css']);
});

gulp.task('js', () => {
    return gulp.src([
        'node_modules/ng-file-upload/dist/ng-file-upload.js',
        path.app + '/app.module.js',
        path.app + '/app.config.js',
        path.app + '/core/**/*.js',
        path.app + '/element/**/*.js',
        path.app + '/view/**/*.js',
    ])
        .pipe(concat('app.js'))
        .pipe(babel({presets: ['env']}))

        // deploy uncompressed
        .pipe(gulp.dest(path.distApp + '/assets/js'))

        // deploy minified
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.distApp + '/assets/js'));
});

gulp.task('js:watch', ['js'], () => {
    return gulp.watch(path.app + '/**/*.js', ['js']);
});

gulp.task('img', () => {
    return gulp.src(`${path.app}/data/impression/transparent.png`)
        .pipe(imagemin({verbose: true}))
        .pipe(gulp.dest(`${path.distApp}/data/impression`))
});

gulp.task('img:watch', ['img'], () => {
    return gulp.watch(`${path.app}/data/impression/transparent.png`, ['img']);
});


gulp.task('copy-server', () => {
    return gulp.src([
        `${path.server}/**`,
        // remove data and log
        `!${path.server}/data{,/**}`,
        `!${path.server}/log{,/**}`,
    ])
        .pipe(gulp.dest(path.distServer));
});

gulp.task('copy-server:watch', ['copy-server'], () => {
    return gulp.watch(path.server + '/**/*', ['copy-server']);
});

gulp.task('copy-package', () => {
    return gulp.src([
        'package.json',
        'package-lock.json'
    ])
        .pipe(gulp.dest(path.dist));
});

gulp.task('build', ['htmlTemplates', 'htmlIndex', 'css', 'js', 'img', 'copy-server', 'copy-package']);
gulp.task('default', ['build']);

gulp.task('watch', ['htmlTemplates:watch', 'htmlIndex:watch', 'scss:watch', 'css:watch', 'js:watch', 'img:watch', 'copy-server:watch']);