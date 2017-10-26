var gulp = require( 'gulp' ),
    notify = require( 'gulp-notify' ),
    rename = require('gulp-rename'),
    uglify = require( 'gulp-uglify' ),

    babel = require( 'babelify' ),
    browserify = require( 'browserify' ),
    del = require( 'del' ),
    buffer = require( 'vinyl-buffer' ),
    source = require( 'vinyl-source-stream' ),
    watchify = require('watchify');

// deletes the old compiled file if it exists, for security's sake
gulp.task( 'clean', function(){
  return del( './public/bundle.min.js' );
});

// compiling script
gulp.task( 'build', ['clean'], function(){
  return browserify( './src/render.js' )
    .transform( "babelify", { presets: ["env"] } )
    .bundle()
    .pipe( source( 'render.js' ) )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename( 'bundle.min.js' ) )
    .pipe( gulp.dest( './public' ) )
});

// Runs tests on any file changes in js/ folder
gulp.task( 'watch', function(){
  gulp.watch( './src/*', ['build'] );
});

gulp.task( 'default', ['watch'] );
