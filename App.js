// Controller module, 'Main' server script
const express = require( 'express' );
const App = express();
const server = require( 'http' ).createServer( App );
const io = require( 'socket.io' )( server );

let userList = [];
let userJoinCount = 0; // Total joined user tally

// Routing stuff
App.use( express.static( __dirname + '/public' ) );

App.get( '/', function( req, res ){
  res.sendFile( __dirname + '/public/client.html' );
});

// Function which is called when a connection is made to this server
// All handshakes required with the client is declared within this function
io.on( 'connection', function( client ){
  console.log( 'Client connected!' );

  client.on( 'set-input', function(){
    client.status = "prompting";
    //client.emit( 'input-prompt' );
  });

  client.on( 'join', function( data ){
    for( let i = 0; i < userList.length; i++ ){
      if( userList[ i ].username === data ){
        client.emit( 'input-reprompt' );
        return;
      }
    }

    client.username = data;
    userList.push( client );
    userJoinCount++;
    client.join( 0 ); // TODO: seperate rooms
    client.emit( 'start' );

    // Entry feedback
    client.emit( 'get-message', "Welcome to the Chatroom, " + client.username );
    client.broadcast.to( 0 ).emit( 'get-message', client.username + " has connected." );  // TODO: seperate rooms
  });

  client.on( 'post-message', function( data ){
    let message = data.sender + ": " + data.value;
    client.emit( 'get-message', message );
    client.broadcast.to( 0 ).emit( 'get-message', message );  // TODO: seperate rooms
  });

  client.on( 'disconnect', function(){
    if( client.username ){
      userList.splice( userList.indexOf( client.username ), 1 );
      client.broadcast.to( 0 ).emit( 'get-message', client.username + " has disconnected." ); // TODO: seperate rooms
    }
  });

  client.emit( 'input-prompt' );
});

server.listen( 3000 );
