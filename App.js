/* --Controller Module-- */

  // Helper Math Extensions
  Math.GenerateRandomColorValue = function(){
    return Math.round( Math.random() * 255 );
  };

  // Dependencies
  const express = require( 'express' );
  const App = express();
  const server = require( 'http' ).Server( App );
  const io = require( 'socket.io' )( server );
  const now = require( 'performance-now' );

  // Routing stuff
  App.use( express.static( __dirname + '/public' ) );

  App.get( '/', function( req, res ){
    res.sendFile( __dirname + '/public/client.html' );
  });
  App.set( 'port', process.env.PORT || process.env.NODE_PORT || 3000 );
  //App.listen( App.get( 'port' ) );

  // Model Imports
  const BubbleModels = require( './src/Bubble.js' );

  // Mechanicals
  let lrc;
  let userCount = 0;
  let socketList = [];
  let playerList = [];
  let neutralList = [];
  let bloomsList = [];
  let bubbleList = [];

  // Constants
  const PLAYER_RADIUS = 0.05;
  const BUBBLE_PER_PLAYER = 5;

// Function which is called when a connection is made to this server
// All handshakes required with the client is declared within this function
io.on( 'connection', function( client ){
  console.log( "Client connected!" );

  // User attempt to join with a username value
  client.on( 'join', function( data ){
    // Scan through currently joined users to rject duplicate usernames
    for( let i = 0; i < socketList.length; i++ ){
      if( socketList[ i ].username === data ){
        client.emit( 'input-reprompt' );
        return;
      }
    }

    // Username appropriate, begin join process
    client.username = data;
    socketList.push( client );
    userCount++;
    client.join( 0 ); // TODO: seperate rooms
    client.emit( 'start' );

    // Player's bubble generation, and list insertion
    client.bubble = BubbleModels.PlayerBubble(
      PLAYER_RADIUS,
      { x: Math.random(), y: Math.random() },
      client.username,
      Math.GenerateRandomColorValue(),
      Math.GenerateRandomColorValue(),
      Math.GenerateRandomColorValue() );
    playerList.push( client.bubble );

    // Inflate current neutralList
    for( let i = 0; i < BUBBLE_PER_PLAYER; i++ ){
      neutralList.push( BubbleModels.NeutralBubble() );
    }

    // Concat all bubble lists only when changes occur
    let bubbleRef = playerList;
    bubbleList = bubbleRef.concat( neutralList );

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
      socketList.splice( socketList.indexOf( client.username ), 1 );
      client.broadcast.to( 0 ).emit( 'get-message', client.username + " has disconnected." ); // TODO: seperate rooms

      userCount--;

      // Remove bubble associated with user
      let ir = playerList.indexOf( client.bubble ); // NOTE: indexOf causes browser compatability errors
      if( ir > -1 ){
        playerList.splice( ir, 1 );
      }

      // Concat all bubble lists only when changes occur
      let bubbleRef = playerList;
      bubbleList = bubbleRef.concat( neutralList );

      // Scan through existing data list, then remove user
      for( let i = socketList.length - 1; i >= 0; i-- ){
        if( socketList[ i ].username === client.username ){
          socketList.splice( i, 1 );
          return;
        }
      }
    }
  });

  // Called during game frame loops
  client.on( 'pull-gamedata', function(){
    client.emit( 'get-gamedata', bubbleList );
  });

  client.on( 'push-mousedata', function( data ){
    // Scan through existing data list
    for( let i = 0; i < socketList.length; i++ ){
      if( socketList[ i ].username === data.u ){
        if( !data.d ){
          socketList[ i ].bubble.scan = false; // TODO: 'scan' is not descriptive enough
        } else {
          socketList[ i ].bubble.scan = true;
          socketList[ i ].bubble.pos  = data.p;
          return;
        }
      }
    }
  });
});

// Game Setup
const gameInit = function(){
  for( let i = 0; i < BUBBLE_PER_PLAYER; i++ ){
    neutralList.push( BubbleModels.NeutralBubble() );
  }

  server.listen( App.get( 'port' ) );
  gameLoop();
};

// Game Loop which records frame timings
const gameLoop = function(){
  if( !lrc ){
    lrc = now();
    setImmediate( gameLoop );
  }

  let delta = ( now() - lrc );
  lrc = now();

  gameCycle( delta / 1000 );
  setImmediate( gameLoop );
};

// Game Calculations, sensitive to frame timings
const gameCycle = function( tbf ){
  let changedList = false;
  let newBubbleTally = 0;

  // Neutral Cycles
  for( let i = neutralList.length - 1; i >= 0; i-- ){
    if ( BubbleModels.NeutralCycle( neutralList[ i ], tbf ) ){
      changedList = true;
      newBubbleTally++;
      bloomsList.push(
        BubbleModels.BloomBubble( neutralList[ i ] ) );
      neutralList.splice( i, 1 );
    }
  }

  // Blooms Cycle
  for( let i = bloomsList.length - 1; i >= 0; i-- ){
    if( bloomsList[ i ].delete ){
      changedList = true;
      bloomsList.splice( i, 1 );
    } else {
      BubbleModels.BloomCycle( bloomsList[ i ], tbf );
    }
  }

  // Postloop Arraylist modification cleanup
  if( changedList ){
    for( let i = 0; i < newBubbleTally; i++ ){
      // Prevent more Neutrals from spawning if above the current limit
      if( newBubbleTally > ( userCount + 1 ) * BUBBLE_PER_PLAYER ){
        break;
      } else {
        neutralList.push( BubbleModels.NeutralBubble() );
        newBubbleTally--;
      }
    }

    gameCalculate();

    // Concat all bubble lists only when changes occur
    let bubbleRef = playerList;
    let bubbleRef2 = bubbleRef.concat( bloomsList );
    bubbleList = bubbleRef2.concat( neutralList );
  } else {
    gameCalculate();
  }
};

// Process intensive loop
const gameCalculate = function(){
  for( let i = 0; i < playerList.length; i++ ){
    for( let o = 0; o < neutralList.length; o++ ){
      BubbleModels.CollisionScan( playerList[ i ], neutralList[ o ] );
    }
  }
};

gameInit();
