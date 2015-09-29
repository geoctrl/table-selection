var gulp = require('gulp'),
  connect = require('gulp-connect'),
  babel = require('gulp-babel'),
  watch = require('gulp-watch'),
  concat = require('gulp-concat'),
  plumber = require('gulp-plumber'),
  runSequence = require('run-sequence'),
  livereload = require('gulp-livereload'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  flatten = require('gulp-flatten');


gulp.task('js', function() {
  return gulp.src([
    'build/table-selection.js'
  ])
    .pipe(flatten())
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('index', function() {
  return gulp.src('build/index.html')
    .pipe(plumber())
    .pipe(gulp.dest('dist'))
});

gulp.task('sass', function() {
  return gulp.src('build/table-selection.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['> 5%']
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('vendors', function() {
  return gulp.src(['build/lib/lodash/lodash.min.js'])
    .pipe(gulp.dest('dist'));
});

gulp.task('connect', function () {
  connect.server({
    root: 'dist',
    port: 7000,
    livereload: true
  });
  livereload.listen();
});

gulp.task('reload', function() {
  livereload.reload();
});

gulp.task('watch', function () {
  gulp.watch('build/table-selection.js', function() {
    runSequence(['js'], ['reload']);
  });

  gulp.watch('build/**/*.scss', function() {
    runSequence('sass', ['reload']);
  });

  gulp.watch('build/index.html', function() {
    runSequence('index', ['reload']);
  });

});

gulp.task('default', [
  'connect',
  'index',
  'js',
  'sass',
  'watch',
  'vendors'
]);