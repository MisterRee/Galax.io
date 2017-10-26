// View Module
let socket,
    textarea, writebox, sendbox, cvs, ctx;
let connection = false;

// Method which handles server connection setup
const serverConnect = function(){
  if( connection ){ //If true, connection is already made
    return;
  };

  socket = io.connect();

  // declaring socket functions here
  socket.on( 'connect', function(){
    //textarea.value = 'Welcome to the chatroom';
    socket.emit( 'join', 'Hello from the Client-side' );
  });

  socket.on( 'get-message', function( data ){
    textarea.value += '\n' + data;
  });

  connection = true;
};

const postMessage = function(){
  if( !connection || !writebox.value ){
    return;
  };

  console.log( "sending " + writebox.value );

  socket.emit( 'post-message', { value: writebox.value } );
  writebox.value = "";
};

const init = function(){
  cvs = document.querySelector( 'canvas' );
  ctx = cvs.getContext( '2d' );
  textarea = document.querySelector( 'textarea' );
  writebox = document.querySelector( '#writebox' );
  sendbox =  document.querySelector( '#sendbox' );

  serverConnect();

  // For enter key event
  function handle( e ){
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
