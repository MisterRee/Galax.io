// Controller module, 'Main' server script

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
// All handshakes required with the client is declared within this function
io.on( 'connection', function( client ){
  console.log( 'Client connected!' );

  client.on( 'join', function( data ){
    console.log( data );
    client.join( 0 );
    client.broadcast.to( 0 ).emit( 'get-message', "Someone has joined the chatroom" );
  });

  client.on( 'post-message', function( data ){
    console.log( data );
    client.emit( 'get-message', data.value );
    client.broadcast.to( 0 ).emit( 'get-message', data.value );
  });
});

server.listen( 3000 );
