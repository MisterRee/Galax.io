/* --View Module-- */
// TODO: This file needs to be rerouted to /src after development

   // Engines
  let socket, cvs, ctx;

   // HTML Elements & UI References
  let textarea, cWritebox, cSendbox, pWritebox, pSendbox, pWarningbox;

   // Mechanics
  let connection = false;
  let username;
  let warningBlock = false;

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

  // Dynamic CSS value resets
  const resize = function(){
    let width = window.innerWidth
             || document.documentElement.clientWidth
             || document.body.clientWidth;
    textarea.style.width = width + "px";
  };
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

    socket.on( 'connect', function(){
      document.querySelector( '#loader-wrapper' ).classList += "loaded";
    });

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

    socket.on( 'start', function(){
      connection = true;
      username = pWritebox.value;
      document.querySelector( '#prompt-wrapper' ).classList += "done";
    });

    socket.on( 'get-message', function( data ){
      textarea.value += '\n' + data;
    });

  // After all setups are finished, finally set key binds
  document.addEventListener( 'keypress', handleKeyPress, false );
};

// For enter key event
const handleKeyPress = function( e ){
  if( connection ){
    // This causes any key to type into the chatbox without having to manually refocus after each enter press
    cWritebox.focus();

    if( e.keyCode == 13 ){ // enter key
      postMessage();
    }
  } else {
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

window.onload = init;
