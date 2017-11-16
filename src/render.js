// View Module

 // Engines
let socket, cvs, ctx;

 // HTML Elements & UI References
let textarea, cWritebox, cSendbox, pWritebox, pSendbox;

 // Mechanics
let connection = false;
let userID;

 // Starts socket engine
const serverConnect = function(){
  if( connection ){ //If true, connection is already made
    return;
  }

  // Prompt Setup
  pWritebox = document.querySelector( '#prompt-writebox' );
  pSendbox =  document.querySelector( '#prompt-sendbox'  );

  const sendPrompt = function(){
    const data = pWritebox.value;
    socket.emit( 'join', data );
  };

  pSendbox.addEventListener( 'click', sendPrompt, false );

  socket = io.connect();

  socket.on( 'connect', function(){
    connection = true;
    document.querySelector( '#loader-wrapper' ).classList += "loaded";
  });

  socket.on( 'input-reprompt', function(){
    pWritebox.value = "";
    // TODO: User feedback that name already exists in active array
  });

  socket.on( 'start', function(){
    console.log( "recieved" );
    document.querySelector( '#prompt-wrapper' ).classList += "done";
  });

  socket.on( 'get-message', function( data ){
    textarea.value += '\n' + data;
  });
};

// Prompting server to send message to everyone in the room
const postMessage = function(){
  if( cWritebox.value ){
    return;
  }

  socket.emit( 'post-message', { sender: userID, value: cWritebox.value } );
  cWritebox.value = "";
};

// Connects HTML Element references, setup dynamic CSS, setup event handlers
const init = function(){
  cvs = document.querySelector( 'canvas' );
  ctx = cvs.getContext( '2d' );
  textarea  = document.querySelector( '#chatbox' );
  cWritebox = document.querySelector( '#chat-writebox' );
  cSendbox  = document.querySelector( '#chat-sendbox'  );

  // Dynamic CSS value resets
  const resize = function(){
    let width = window.innerWidth
             || document.documentElement.clientWidth
             || document.body.clientWidth;
    textarea.style.width = width + "px";
  };

  resize();
  window.onresize = resize;

  // Fix for browser tab duplicating
  textarea.value = "";

  // For enter key event
  function handle( e ){
    if( connection ){

    } else {
      // This causes any key to type into the chatbox without having to manually refocus after each enter press
      writebox.focus();

      if( e.keyCode == 13 ){
        postMessage();
      }
    }
  };

  // Adding events for keyboard and pressing enter for the chat
  cSendbox.addEventListener( 'click', postMessage, false );
  document.addEventListener( 'keypress', handle, false );

  // Start socket engine
  serverConnect();
};

/*
const userIDprompt = function(){
  let value = prompt( "Enter a username: ", "Your Username" );
  if( !prompt ){
    userIDprompt();
  };

  userID = value;
  init();
};
*/

window.onload = init;
