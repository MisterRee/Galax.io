/* --View Module-- */

  // Helper
  const Draw = ( _bub, _ctx, _cvsw, _cvsh ) => {
   _ctx.fillStyle = _bub.clr;
   _ctx.beginPath();
   _ctx.ellipse(
     _bub.pos.x * _cvsw,
     _bub.pos.y * _cvsh,
     _bub.rad * _cvsw,
     _bub.rad * _cvsh,
     0, 0, Math.PI * 2 );
     _ctx.fill();
  };

  // Dependencies
  const now = require( 'performance-now' );

   // Engines
  let socket, cvs, ctx;

   // HTML Elements & UI References
  let chatwrap, textarea, cWritebox, cSendbox, pWritebox, pSendbox, pWarningbox;

   // Mechanics
  let cvsw, cvsh, tbr, lrc, mdr, mec;
  let connection = false;
  let warningBlock = false;
  let username, gamePacket;

// Dynamic CSS value resets
const windowResize = () => {
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

const chatFocusToggleOn = () => {
  if( !chatwrap.classList.contains( "focused" ) ){
    chatwrap.classList += "focused";
  }
};

const chatFocusToggleOff = () => {
  chatwrap.classList.remove( "focused" );
};

const cvsMouseOver = ( e ) => {
  // Since events can fire off faster than frames
  // Prevent more than one data push between one effective frame
  if( !mdr || !connection ){
    return;
  }
  mdr = false;

  const rect = cvs.getBoundingClientRect();

  mec = {
   u: username,
   d: true,
   p: { x: ( e.clientX - rect.x ) / cvsw, y: ( e.clientY - rect.y ) / cvsh }
  };

   socket.emit( 'push-mousedata', mec );
};

// Indicates that user's mouse is currently off the play canvas
// Prevents the user's bubble from being drawn
// TODO: This might interfere with future collision detection
const cvsMouseOut = ( e ) => {
  // MouseOut event is not limited to Synchronious framerate
  if( !connection ){
    return;
  }
  mdr = false;

  mec = {
    u: username,
    d: false
  };

  socket.emit( 'push-mousedata', mec );
};

const init = () => {
  // Set References
  cvs = document.querySelector( 'canvas' );
  ctx = cvs.getContext( '2d' );
  chatwrap    = document.querySelector( '#chat-wrapper' );
  textarea    = document.querySelector( '#chatbox' );
  cWritebox   = document.querySelector( '#chat-writebox' );
  cSendbox    = document.querySelector( '#chat-sendbox' );
  pWritebox   = document.querySelector( '#prompt-writebox' );
  pSendbox    = document.querySelector( '#prompt-sendbox' );
  pWarningbox = document.querySelector( '#prompt-warning' )

  // Mechanical Setup
  windowResize();
  window.onresize = windowResize;
  cSendbox.addEventListener( 'click', postMessage, false );
     cvs.addEventListener( 'click', chatFocusToggleOff, false );
     cvs.addEventListener( 'mouseover', cvsMouseOver, false );
     cvs.addEventListener( 'mousemove', cvsMouseOver, false );
     cvs.addEventListener( 'mouseout',  cvsMouseOut,  false );

   // Clear fields jic
   textarea.value  = "";
   cWritebox.value = "";
   pWritebox.value = "";

  serverConnect(); // Start socket engine
};

 // Starts socket engine
const serverConnect = () => {
  if( connection ){ // No need to reconnect
    return;
  }

  socket = io.connect();

    // Swap off loading phase
    socket.on( 'connect', () => {
      document.querySelector( '#loader-wrapper' ).classList += "loaded";
    });

    // Setup for possible reprompting user in case of input error
    const sendPrompt = () => {
      const data = pWritebox.value;
      socket.emit( 'join', data );
    };

    pSendbox.addEventListener( 'click', sendPrompt, false );
    socket.on( 'input-reprompt', () => {
      pWritebox.focus();

      if( pWarningbox.classList ){
        // Remove dormant class and readd to start css3 animation fadeout
        pWarningbox.classList = "";

        if( !warningBlock ){
          warningBlock = true;
          setTimeout( () => {
            warningBlock = false;
            pWarningbox.classList += "dormant";
          }, 2000 );
        }
      }
    });

    // Swap on into game phase
    socket.on( 'start', () => {
      connection = true;
      username = pWritebox.value;
      document.querySelector( '#prompt-wrapper' ).classList += "done";
      tbr = 0;
      clientLoop();
    });

    // Post message to chat
    socket.on( 'get-message', ( data ) => {
      textarea.value += '\n' + data;
    });

    // Feed from data stream
    socket.on( 'get-gamedata', ( data ) => {
      gamePacket = data;
    });

  // After all setups are finished, finally set key binds
  document.addEventListener( 'keypress', handleKeyPress, false );
};

// For enter key event
const handleKeyPress = ( e ) => {
  if( connection ){
    // Any key press will focus into the chatbox
    cWritebox.focus();
    chatFocusToggleOn();

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
const postMessage = () => {
  if( !cWritebox.value ){
    return;
  }

  socket.emit( 'post-message', { sender: username, value: cWritebox.value } );
  cWritebox.value = "";
};

// Loop starts once game state begins, Synchroniously paced game loop
const clientLoop = () => {
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
const clientDraw = () => {
  // Clear frame
  ctx.fillStyle = "black";
  ctx.fillRect( 0, 0, cvsw, cvsh );

  if( !gamePacket ){
    return;
  };

  for( let i = 0; i < gamePacket.length; i++ ){
    if( !gamePacket[ i ].scan ){ // TODO: 'scan' is not descriptive enough
      continue;
    }
    const temp = gamePacket[ i ];

    Draw( temp, ctx, cvsw, cvsh );

    if( temp.name && temp.class === "player"){
      const str = temp.name;
      const x = Math.round( temp.pos.x * cvsw - ctx.measureText( str ).width / 2 );
      const y = Math.round( temp.pos.y * cvsh + ctx.measureText( 'M' ).width / 2 ); // NOTE: close vertical height approximation with length of M
      ctx.fillStyle = "white";
      ctx.font = "24px Verdana";
      ctx.fillText( temp.name, x, y );
    }
  };
};

window.onload = init;
