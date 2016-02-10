var gulp = require('gulp');
var concat = require('gulp-concat');
var browserSync = require('browser-sync').create();
var browserify = require('browserify-incremental');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var assign = require('lodash/assign');
var reactify = require('reactify');
var brfs = require('brfs');
var envify = require('envify');

//TODO sourcemaps
//TODO production build (including minification)

var srcDir = 'src';
var baseDir = 'static';
var distDir = baseDir + '/compiled';
var stylesheetsDir = srcDir + '/css';

var browserifyDone = Promise.resolve();

var browserifyOpts = {
  entries: ['src/application.js'],
  extensions: ['.jsx'],
  transform: [reactify, brfs, envify],
};
var browserifyCompiler = browserify(browserifyOpts);
// var browserifyWatcher = watchify(browserifyCompiler);

gulp.task('css', function() {
  return gulp.src(stylesheetsDir + '/**/*.css').
    pipe(concat('application.css')).
    pipe(gulp.dest(distDir)).
    pipe(browserSync.reload({stream: true}));
});

// https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
// https://www.npmjs.com/package/watchify-request

gulp.task('js', function() {
  var stream;

  browserifyDone = new Promise(function(resolve, reject) {
    stream = browserifyCompiler.bundle().
      pipe(source('application.js')).
      pipe(buffer()).
      pipe(gulp.dest(distDir)).
      pipe(browserSync.reload({stream: true})).
      on('end', resolve).
      on('error', reject);
  });

  return stream;
});

gulp.task('watch', ['browserSync', 'css', 'js'], function() {
  gulp.watch(stylesheetsDir + '/**/*.css', ['css']);
  gulp.watch(srcDir + '/**/*.js', ['js']);
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: baseDir,
      middleware: function(_req, _res, next) {
        browserifyDone.then(next);
      },
    },
  });
});
