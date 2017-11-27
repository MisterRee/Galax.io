  // install devDependencies prior to running
  var gulp = require( 'gulp' ),
      notify = require( 'gulp-notify' ),
      rename = require( 'gulp-rename' ),
      uglify = require( 'gulp-uglify' ),

      babel = require( 'babelify' ),
      browserify = require( 'browserify' ),
      del = require( 'del' ),
      buffer = require( 'vinyl-buffer' ),
      source = require( 'vinyl-source-stream' ),

      runSequence = require( 'run-sequence' ),
      spawn = require( 'child_process' ).spawn, // child_process is from node
      node;

  // deletes the old compiled file if it exists, for security's sake
  gulp.task( 'clean', function(){
    return del( './public/bundle.min.js' );
  });

  // compiling script
  gulp.task( 'build', function(){
    return browserify( './src/render.js' )
      .transform( "babelify", { presets: ["env"] } )
      .bundle()
      .pipe( source( 'render.js' ) )
      .pipe( buffer() )
      .pipe( uglify() )
      .pipe( rename( 'bundle.min.js' ) )
      .pipe( gulp.dest( './public' ) )
  });

  // restart npm server after building gulp
  gulp.task( 'server', function(){
    if ( node ) node.kill; // restart any running servers

    node = spawn( 'node', ['App.js'], { stdio: 'inherit' });
    node.on( 'close', function ( code ){
      if( code === 8 ){
        gulp.log( 'Error detected, waiting for changes...' );
      };
    });
  });

// Sequencially runs gulp tasks
gulp.task( 'reboot', function( done ){
  runSequence( 'clean', 'build', 'server', function(){
    done();
  });
});

// Runs tests on any file changes in development folders
gulp.task( 'watch', function(){
  gulp.watch( ['./App.js', './src/**', './public/**'], ['reboot'] );
});

gulp.task( 'default', ['watch', 'server'] );

// Clean method for errors
process.on( 'exit', function(){
  if ( node ) node.kill
});
