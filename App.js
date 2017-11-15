// Controller module, 'Main' server script
const express = require( 'express' );
const App = express();
const server = require( 'http' ).createServer( App );
const io = require( 'socket.io' )( server );

let userList = [];
let userJoinCount = 0;

// Routing stuff
App.use( express.static( __dirname + '/public' ) );

App.get( '/', function( req, res ){
  res.sendFile( __dirname + '/public/client.html' );
});

// Function which is called when a connection is made to this server
// All handshakes required with the client is declared within this function
io.on( 'connection', function( client ){
  console.log( 'Client connected!' );

  client.on( 'join', function(){
    client.join( 0 ); // TODO: seperate rooms

    // Generating userID TODO: create better id tag generation for users
    client.userID = userJoinCount;
    userList.push( userJoinCount );
    userJoinCount++;

    // Entry feedback
    client.emit( 'get-message', "Welcome to the Chatroom, your Client number is " + client.userID );
    client.broadcast.to( 0 ).emit( 'get-message', "Client number" + client.userID + " has connected." );  // TODO: seperate rooms
  });

  client.on( 'post-message', function( data ){
    let message = data.sender + ": " + data.value;
    client.emit( 'get-message', message );
    client.broadcast.to( 0 ).emit( 'get-message', message );  // TODO: seperate rooms
  });

  client.on( 'disconnect', function(){
    userList.splice( userList.indexOf( client.userID ), 1 );
    client.broadcast.to( 0 ).emit( 'get-message', "Client number " + client.userID + " has disconnected." ); // TODO: seperate rooms
  });
});

server.listen( 3000 );
