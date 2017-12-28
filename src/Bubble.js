/* --Model Module-- */

  // Helper Math Extension
  Math.GenerateRandomWithinDomain = function( min, max ){
    return Math.random() * ( max - min ) + min;
  }

  // Constants
  const MIN_NEUTRAL_RADIUS = 0.025;
  const MAX_NEUTRAL_RADIUS = 0.05;
  const MIN_NEUTRAL_DECAY_RADIUS = 0.1;
  const MIN_BLOOM_DECAY_RATE = 0.005;
  const MAX_BLOOM_DECAY_RATE = 0.05;
  const MAX_BLOOM_RATIO = 1.25;
  const MAX_NEUTRAL_VELOCITY = 0.05;

// enapsulated object
function Bubble( _rad, _crd, _clr ){
  // Constraints, values between 0 - 1 as floats
  this.rad = _rad;
  this.baseRad = _rad;
  this.decayRate = Math.GenerateRandomWithinDomain( MIN_BLOOM_DECAY_RATE, MAX_BLOOM_DECAY_RATE );

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
      Math.GenerateRandomWithinDomain( MIN_NEUTRAL_RADIUS, MAX_NEUTRAL_RADIUS ),
      { x: Math.random(), y: Math.random() },
      "rgba( 128, 128, 128, 0.5 )" );
    temp.vel = { x: Math.GenerateRandomWithinDomain( 0, 2 * MAX_NEUTRAL_VELOCITY ) - MAX_NEUTRAL_VELOCITY,
                 y: Math.GenerateRandomWithinDomain( 0, 2 * MAX_NEUTRAL_VELOCITY ) - MAX_NEUTRAL_VELOCITY };
    return temp;
  },

  // Helper function to cycle through Neutral Bubble Shrinking Process
  NeutralCycle: function( pBubble, time ){
    pBubble.pos.x += pBubble.vel.x * time;
    pBubble.pos.y += pBubble.vel.y * time;

    // Edge wrapping
    if( pBubble.pos.x < 0 ){
      pBubble.pos.x += 1;
    } else if ( pBubble.pos.x > 1 ){
      pBubble.pos.x -= 1;
    }

    if( pBubble.pos.y < 0 ){
      pBubble.pos.y += 1;
    } else if ( pBubble.pos.y > 1 ){
      pBubble.pos.y -= 1;
    }

    pBubble.rad = pBubble.rad * ( 1 - ( pBubble.decayRate * time ) );

    if( pBubble.rad < ( pBubble.baseRad * MIN_NEUTRAL_DECAY_RADIUS ) ){
      return true;
    } else {
      return false;
    }
  },

  // Generate Blooming Bubble Object Preset
  BloomBubble: function( _startRad, _coord ){
    let temp = new Bubble(
      _startRad,
      { x: _coord.x, y: _coord.y },
      "rgba( 128, 128, 128, 0.25 )" );
    temp.baseRad = Math.GenerateRandomWithinDomain( MIN_NEUTRAL_RADIUS, MAX_NEUTRAL_RADIUS );
  }
};
