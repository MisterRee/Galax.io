/* --Controller Module-- */

  // Controlling Dependencies
  const express = require( 'express' );
  const App = express();
  const server = require( 'http' ).createServer( App );
  const io = require( 'socket.io' )( server );

  // Routing stuff
  App.use( express.static( __dirname + '/public' ) );

  App.get( '/', function( req, res ){
    res.sendFile( __dirname + '/public/client.html' );
  });

  // Model Imports
  const BubbleModels = require( './src/Bubble.js' );

  // Mechanicals
  let userJoinCount = 0; // Total joined user tally
  let userList = [];
  let bubbleList = [];
  let neutralList = [];

  // Constants
  const BUBBLE_PER_PLAYER = 5;

// Function which is called when a connection is made to this server
// All handshakes required with the client is declared within this function
io.on( 'connection', function( client ){
  console.log( "Client connected!" );

  // User attempt to join with a username value
  client.on( 'join', function( data ){
    // Scan through currently joined users to rject duplicate usernames
    for( let i = 0; i < userList.length; i++ ){
      if( userList[ i ].username === data ){
        client.emit( 'input-reprompt' );
        return;
      }
    }

    // Username appropriate, begin join process
    client.username = data;
    userList.push( client );
    userJoinCount++;
    client.join( 0 ); // TODO: seperate rooms
    client.emit( 'start' );

    // Player's bubble generation, and list insertion
    // TODO: Find a damn libary for this stupid color alg
    client.bubble = new BubbleModels.Bubble( 0.05, { x: Math.random(), y: Math.random() },
      "rgba(" + Math.round( Math.random() * 255 ) + ","
             + Math.round( Math.random() * 255 ) + ","
             + Math.round( Math.random() * 255 ) + ",0.5)" );
    bubbleList.push( client.bubble );

    // Entry feedback
    client.emit( 'get-message', "Welcome to the Chatroom, " + client.username );
    client.broadcast.to( 0 ).emit( 'get-message', client.username + " has connected." );  // TODO: seperate rooms
  });

  // Broadcast to currently joined users a message
  client.on( 'post-message', function( data ){
    let message = data.sender + ": " + data.value;
    client.emit( 'get-message', message );
    client.broadcast.to( 0 ).emit( 'get-message', message );  // TODO: seperate rooms
  });

  // Utility for abrupt disconnects
  client.on( 'disconnect', function(){
    if( client.username ){
      userList.splice( userList.indexOf( client.username ), 1 );
      client.broadcast.to( 0 ).emit( 'get-message', client.username + " has disconnected." ); // TODO: seperate rooms

      // Remove bubble associated with user
      let ir = bubbleList.indexOf( client.bubble ); // NOTE: indexOf causes browser compatability errors
      if( ir > -1 ){
        bubbleList.splice( ir, 1 );
      }

      // Scan through existing data list, then remove user
      for( let i = userList.length - 1; i >= 0; i-- ){
        if( userList[ i ].username === client.username ){
          userList.splice( i, 1 );
          return;
        }
      }
    }
  });

  // Called during game frame loops
  client.on( 'pull-gamedata', function(){
    let bubbleRef = bubbleList;
    let mergeLists = bubbleRef.concat( neutralList );
    client.emit( 'get-gamedata', mergeLists );
  });

  client.on( 'push-mousedata', function( data ){
    // Scan through existing data list
    for( let i = 0; i < userList.length; i++ ){
      if( userList[ i ].username === data.u ){
        if( !data.d ){
          userList[ i ].bubble.draw = false;
        } else {
          userList[ i ].bubble.draw = true;
          userList[ i ].bubble.pos = data.p;
          return;
        }
      }
    }
  });
});

// Game Setup
const gameInit = function(){
  for( let i = 0; i < BUBBLE_PER_PLAYER; i++ ){
    neutralList.push( new BubbleModels.NeutralBubble() );
  }

  server.listen( 3000 );
  gameLoop();
};

// Game Cycle
const gameLoop = function(){

};

gameInit();
