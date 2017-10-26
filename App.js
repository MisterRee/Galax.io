const express = require( 'express' );
const App = express();
const server = require( 'http' ).createServer( App );
const io = require( 'socket.io' )( server );

// Routing stuff
App.use( express.static( __dirname + '/public' ) );

App.get( '/', function( req, res ){
  res.sendFile( __dirname + '/public/client.html' );
});

// Function which is called when a connection is made to this server
// All functions which the client requires is declared within this function
io.on( 'connection', function(){
  console.log( 'Client connected!' );
});

server.listen( 3000 );
