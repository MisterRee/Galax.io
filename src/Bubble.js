/* --Model Module-- */

  // Helper Math Extension
  Math.GenerateRandomWithinDomain = function( min, max ){
    return Math.random() * ( max - min + 1 ) + min;
  }

  // Constants
  const PLAYER_RADIUS = 0.05;
  const MIN_DECAY = 0.005;
  const MAX_DECAY = 0.05;
  const MIN_RAD = 0.025;

// enapsulated object
function Bubble( _rad, _crd, _clr ){
  // Constraints, values between 0 - 1 as floats
  this.rad = _rad;
  this.baseRad = _rad;
  this.decayRate = Math.GenerateRandomWithinDomain( MIN_DECAY, MAX_DECAY );

  // Physics, values between 0 - 1 as floats
  this.pos = { x: _crd.x, y: _crd.y };
  this.vel = { x: 0,     y: 0 };
  this.acl = { x: 0,     y: 0 };

  // Draw Data
  this.clr = _clr;

  // Mechanical
  this.scan = true; // TODO: 'scan' is not descriptive enough
  this.player = false;
};

// Static functions for the controller module to interface with
module.exports = {
  // Generate Player Bubble Object Preset
  PlayerBubble: function( _rad, _crd, _clr ){
    let temp = new Bubble( _rad, _crd, _clr );
    temp.player = true;
    return temp;
  },

  // Generate Neutral Bubble Object Preset
  NeutralBubble: function(){
    let temp = new Bubble(
      PLAYER_RADIUS,
      { x: Math.random(), y: Math.random() },
      "rgba( 128, 128, 128, 0.5 )" );

    return temp;
  },

  // Helper function to cycle through Neutral Bubble Shrinking Process
  NeutralDecay: function( pBubble, time ){
    pBubble.rad = pBubble.rad * ( 1 - ( pBubble.decayRate * time ) );

    if( pBubble.rad < ( pBubble.baseRad * MIN_RAD ) ){
      return true;
    } else {
      return false;
    }
  },
};
