/* --Controller Module-- */

  // Controlling Dependencies
  const express = require( 'express' );
  const App = express();
  const server = require( 'http' ).createServer( App );
  const io = require( 'socket.io' )( server );

  // Client Counts
  let userList = [];
  let userJoinCount = 0; // Total joined user tally

  // Routing stuff
  App.use( express.static( __dirname + '/public' ) );

  App.get( '/', function( req, res ){
    res.sendFile( __dirname + '/public/client.html' );
  });

  // Model Imports
  const Bubble = require( './src/Bubble.js' );

  // Mechanics
  let bubbleList = [];

// Function which is called when a connection is made to this server
// All handshakes required with the client is declared within this function
io.on( 'connection', function( client ){
  console.log( "Client connected!" );
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

    client.on( 'pull-gamedata', function(){
      client.emit( 'get-gamedata', bubbleList );
    });
});

// Frame Time sensitive function
const gameCalculate = function(){

};


const gameLoop = function(){

};

// Game Setup
const gameInit = function(){
  // TODO: Hardcoded Test Bubble
  bubbleList.push( new Bubble( { x: 0.01, y:  0.01 }, { x: 0.5, y:  0.5 }, "rgba( 255, 0, 0, 0.5 )" ) );
  server.listen( 3000 );
};

gameInit();
