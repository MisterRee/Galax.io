// View Module
let socket,
    textarea, writebox, sendbox, cvs, ctx;
let connection = false;
let userID;

// Method which handles server connection setup
const serverConnect = function(){
  if( connection ){ //If true, connection is already made
    return;
  };

  socket = io.connect();

  // declaring socket functions here
  socket.on( 'connect', function(){
    socket.emit( 'join', 'Hello from the Client-side' );
  });

  socket.on( 'set-ID', function( data ){
    userID = data;
  });

  socket.on( 'get-message', function( data ){
    console.log( data );
    textarea.value += '\n' + data;
  });

  connection = true;
};

// Prompting server to send message to everyone in the room
const postMessage = function(){
  if( !connection || !writebox.value ){
    return;
  };

  socket.emit( 'post-message', { sender: userID, value: writebox.value } );
  writebox.value = "";
};

const init = function(){
  cvs = document.querySelector( 'canvas' );
  ctx = cvs.getContext( '2d' );
  textarea = document.querySelector( 'textarea' );
  writebox = document.querySelector( '#writebox' );
  sendbox =  document.querySelector( '#sendbox' );

  // Setting some css
  textarea.style.width = window.innerWidth + "px";

  textarea.value = ""; // Fix from browser tab duplicating
  serverConnect();

  // For enter key event
  function handle( e ){
    // This causes any key to type into the chatbox without having to manually refocus after each enter press
    writebox.focus();

    if( e.keyCode == 13 ){
      postMessage();
    }
  };

  // Adding events for keyboard and pressing enter for the chat
  sendbox.addEventListener( 'click', postMessage, false );
  document.addEventListener( 'keypress', handle, false );
};

window.onload = init;
