/* --Model Module-- */

  // Helper Math Extension
  Math.GenerateRandomWithinDomain = function( min, max ){
    return Math.random() * ( max - min + 1 ) + min;
  }

  // Constants
  const PLAYER_RADIUS = 0.05;

// enapsulated object
function Bubble( _rad, _crd, _clr ){
  // Constraints, values between 0 - 1 as floats
  this.rad = _rad;

  // Physics, values between 0 - 1 as floats
  this.pos = { x: _crd.x, y: _crd.y };
  this.vel = { x: 0,     y: 0 };
  this.acl = { x: 0,     y: 0 };

  // Draw Data
  this.clr = _clr;

  // Mechanical
  this.scan = true; // TODO: 'scan' is not descriptive enough
};

module.exports = {
  PlayerBubble: function( _rad, _crd, _clr ){
    let temp = new Bubble( _rad, _crd, _clr );
    return temp;
  },

  NeutralBubble: function(){
    let temp = new Bubble(
      PLAYER_RADIUS,
      { x: Math.random(), y: Math.random() },
      "rgba( 128, 128, 128, 0.5 )" );

    return temp;
  }
};
