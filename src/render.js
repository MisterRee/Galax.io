let socket, cvs, ctx;

const init = function(){
  cvs = document.querySelector( 'canvas' );
  ctx = cvs.getContext( '2d' );
  socket = io.connect();

  // declaring socket functions here
};
