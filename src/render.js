/* --View Module-- */

  // Dependencies
  const now = require( 'performance-now' );

   // Engines
  let socket, cvs, ctx;

   // HTML Elements & UI References
  let textarea, cWritebox, cSendbox, pWritebox, pSendbox, pWarningbox;

   // Mechanics
  let cvsw, cvsh, tbr, lrc, mdr, mec;
  let connection = false;
  let warningBlock = false;
  let username, gamePacket;

// Dynamic CSS value resets
const resize = function(){
  // Set UI elements to current window size
  let width = window.innerWidth
           || document.documentElement.clientWidth
           || document.body.clientWidth;
  textarea.style.width = width + "px";

  // Set drawing canvas to current window size
  ctx.canvas.width = window.innerWidth
                  || document.documentElement.clientWidth
                  || document.body.clientWidth;
  ctx.canvas.height = window.innerHeight
                  || document.documentElement.clientHeight
                  || document.body.clientHeight;

  cvsw = ctx.canvas.width;
  cvsh = ctx.canvas.height;
};

const mouseOver = function( e ){
  // Since events can fire off faster than frames
  // Prevent more than one data push between one effective frame
  if( !mdr ){
    return;
  }
  mdr = false;

  const rect = cvs.getBoundingClientRect();

  mec = {
   u: username,
   x: ( e.clientX - rect.x ) / cvsw,
   y: ( e.clientY - rect.y ) / cvsh
  };

   socket.emit( 'push-mousedata', mec );
};

// Connects HTML Element references, setup dynamic CSS, setup event handlers
const init = function(){
  cvs = document.querySelector( 'canvas' );
  ctx = cvs.getContext( '2d' );
  textarea    = document.querySelector( '#chatbox' );
  cWritebox   = document.querySelector( '#chat-writebox' );
  cSendbox    = document.querySelector( '#chat-sendbox' );
  pWritebox   = document.querySelector( '#prompt-writebox' );
  pSendbox    = document.querySelector( '#prompt-sendbox' );
  pWarningbox = document.querySelector( '#prompt-warning' )


  resize();
  window.onresize = resize;
  cSendbox.addEventListener( 'click', postMessage, false );

   // Clear fields
   textarea.value  = "";
   cWritebox.value = "";
   pWritebox.value = "";

  serverConnect(); // Start socket engine
};

 // Starts socket engine
const serverConnect = function(){
  if( connection ){ // No need to reconnect
    return;
  }

  socket = io.connect();

    // Swap off loading phase
    socket.on( 'connect', function(){
      document.querySelector( '#loader-wrapper' ).classList += "loaded";
    });

    // Setup for possible reprompting user in case of input error
    const sendPrompt = function(){
      const data = pWritebox.value;
      socket.emit( 'join', data );
    };
    pSendbox.addEventListener( 'click', sendPrompt, false );
    socket.on( 'input-reprompt', function(){
      pWritebox.focus();

      if( pWarningbox.classList ){
        // Remove dormant class and readd to start css3 animation fadeout
        pWarningbox.classList = "";

        if( !warningBlock ){
          warningBlock = true;
          setTimeout( function(){
            warningBlock = false;
            pWarningbox.classList += "dormant";
          }, 2000 );
        }
      }
    });

    // Swap on into game phase
    socket.on( 'start', function(){
      connection = true;
      username = pWritebox.value;
      document.querySelector( '#prompt-wrapper' ).classList += "done";
      tbr = 0;
      clientLoop();
    });

    // Post message to chat
    socket.on( 'get-message', function( data ){
      textarea.value += '\n' + data;
    });

    // Feed from data stream
    socket.on( 'get-gamedata', function( data ){
      gamePacket = data;
    });

  // After all setups are finished, finally set key binds
  document.addEventListener( 'keypress', handleKeyPress, false );
};

// For enter key event
const handleKeyPress = function( e ){
  if( connection ){
    // Any key press will focus into the chatbox
    cWritebox.focus();

    if( e.keyCode == 13 ){ // enter key
      postMessage();
    }
  } else {
    // For the prompt box
    pWritebox.focus();

    if( e.keyCode == 13 ){ // enter key
      const data = pWritebox.value;
      socket.emit( 'join', data );
    }
  }
};

// Prompting server to send message to everyone in the room
const postMessage = function(){
  if( !cWritebox.value ){
    return;
  }

  socket.emit( 'post-message', { sender: username, value: cWritebox.value } );
  cWritebox.value = "";
};

// Loop starts once game state begins, Synchroniously paced game loop
const clientLoop = function(){
  // First iteration detection
  if( !lrc ){
    lrc = now();
    requestAnimationFrame( clientLoop );
    return;
  }

  // Switch to only allow one mouse data emission to the server during active frame
  mdr = true;

  // Calculating time between frames to incorporate into framing the draw
  let delta = ( now() - lrc );
  lrc = now();
  tbr = delta / 1000;

  // Frame by frame functions here!
  socket.emit( 'pull-gamedata' );
  clientDraw();

  requestAnimationFrame( clientLoop );
};

// Canvas rendering method
const clientDraw = function(){
  // Clear frame
  ctx.fillStyle = "#000";
  ctx.fillRect( 0, 0, cvsw, cvsh );

  if( !gamePacket ){
    return;
  };

  for( let i = 0; i < gamePacket.length; i++ ){
    ctx.fillStyle = gamePacket[i].clr;
    ctx.beginPath();
    ctx.ellipse(
      gamePacket[i].pos.x * cvsw,
      gamePacket[i].pos.y * cvsh,
      gamePacket[i].rad   * cvsw,
      gamePacket[i].rad   * cvsh,
      0, 0, Math.PI * 2 );
    ctx.fill();
  };
};

window.onload = init;
