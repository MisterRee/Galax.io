var gulp = require( 'gulp' ),
    notify = require( 'gulp-notify' ),
    rename = require('gulp-rename'),
    streamify = require('gulp-streamify'),
    uglify = require( 'gulp-uglify' ),
    browserify = require( 'browserify' ),
    source = require( 'vinyl-source-stream' ),
    del = require( 'del' );

// deletes the old compiled file if it exists, for security's sake
gulp.task( 'clean', function(){
  return del( './public/bundle.min.js' );
});

// compiling script
gulp.task( 'build', ['clean'], function(){
  var bundleStream = browserify( './src/render.js' ).bundle();

  bundleStream
    .pipe( source( ( 'render.js' ) ) )
    .pipe( streamify( uglify() ) )
    .pipe( rename( 'bundle.min.js' ) )
    .pipe( gulp.dest( './public' ) )
});

// Runs tests on any file changes in js/ folder
gulp.task( 'watch', function(){
  gulp.watch( './src/*', ['build'] );
});

gulp.task( 'default', ['build'] );
