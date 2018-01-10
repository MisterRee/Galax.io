/* --Model Module-- */

  // Helper Math Extension
  Math.GenerateRandomWithinDomain = ( min, max ) => {
    return Math.random() * ( max - min ) + min;
  }

  const compileColor = ( _r, _g, _b, _a ) => {
    return "rgba(" + _r + "," + _g + "," + _b + "," + _a + ")";
  }


  // Neutral Constants
  const NEUTRAL_RGB = 128;
  const NEUTRAL_ALPHA = 0.5;
  const MIN_NEUTRAL_RADIUS = 0.025;
  const MAX_NEUTRAL_RADIUS = 0.05;
  const MIN_NEUTRAL_DECAY_RADIUS = 0.1;
  const MIN_NEUTRAL_DECAY_RATE = 0.005;
  const MAX_NEUTRAL_DECAY_RATE = 0.05;
  const MAX_NEUTRAL_VELOCITY = 0.05;
  const BLOOM_ALPHA = 0.25;
  const MIN_BLOOM_RADIUS = 0.2;
  const MAX_BLOOM_RADIUS = 1.25;
  const BLOOM_DECAY_RATE = 0.75;

// enapsulated object
function Bubble( _rad, _crd, _clr ){
  // Constraints, values between 0 - 1 as floats
  this.rad = _rad;
  this.baseRad = _rad;
  this.decayRate = Math.GenerateRandomWithinDomain( MIN_NEUTRAL_DECAY_RATE, MAX_NEUTRAL_DECAY_RATE );

  // Physics, values between 0 - 1 as floats
  this.pos = { x: _crd.x, y: _crd.y };
  this.vel = { x: 0,     y: 0 };
  this.acl = { x: 0,     y: 0 };

  // Draw Data
  this.clr = _clr;
  this.r = 0;
  this.g = 0;
  this.b = 0;

  // Mechanical
  this.class = "";
  this.disable = false;
};

// Static functions for the controller module to interface with
module.exports = {
  // Generate Player Bubble Object Preset
  PlayerBubble: ( _rad, _crd, _name, _r, _g, _b ) =>{
    let temp = new Bubble( _rad, _crd,
      compileColor( _r, _g, _b, 1 ) );
    temp.r = _r;
    temp.g = _g;
    temp.b = _b;
    temp.class = "player";
    temp.name = _name;
    return temp;
  },

  // Generate Neutral Bubble Object Preset
  NeutralBubble: () =>{
    let temp = new Bubble(
      Math.GenerateRandomWithinDomain( MIN_NEUTRAL_RADIUS, MAX_NEUTRAL_RADIUS ),
      { x: Math.random(), y: Math.random() },
      compileColor( NEUTRAL_RGB, NEUTRAL_RGB, NEUTRAL_RGB, NEUTRAL_ALPHA ) );
    temp.vel = { x: Math.GenerateRandomWithinDomain( 0, MAX_NEUTRAL_VELOCITY * 2 ) - MAX_NEUTRAL_VELOCITY,
                 y: Math.GenerateRandomWithinDomain( 0, MAX_NEUTRAL_VELOCITY * 2 ) - MAX_NEUTRAL_VELOCITY };
    temp.r = NEUTRAL_RGB;
    temp.g = NEUTRAL_RGB;
    temp.b = NEUTRAL_RGB;
    temp.class = "neutral";
    return temp;
  },

  // Helper function to cycle through Neutral Bubble Shrinking Process
  NeutralCycle: ( pBubble, time ) => {
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

    if( pBubble.rad < pBubble.baseRad * MIN_NEUTRAL_DECAY_RADIUS ){
      return true;
    } else {
      return false;
    }
  },

  // Generate Blooming Bubble Object Preset
  BloomBubble: ( pBubble ) => {
    let temp = new Bubble(
      pBubble.rad,
      { x: pBubble.pos.x, y: pBubble.pos.y },
      compileColor( pBubble.r, pBubble.g, pBubble.b, BLOOM_ALPHA ) );
    temp.baseRad = pBubble.baseRad;
    temp.inflate = true;
    temp.delete = false;
    temp.class = "bloom";
    return temp;
  },

  BloomCycle: ( pBubble, time ) => {
    if( pBubble.inflate ){
      if( pBubble.rad < pBubble.baseRad * MAX_BLOOM_RADIUS ){
        pBubble.rad = pBubble.rad * ( 1 + ( BLOOM_DECAY_RATE * time ) );
      } else {
        pBubble.inflate = false;
      }
    } else {
      if( pBubble.rad > pBubble.baseRad * MIN_BLOOM_RADIUS ){
        pBubble.rad = pBubble.rad * ( 1 - ( BLOOM_DECAY_RATE * time ) );
      } else {
        pBubble.delete = true;
      }
    }
  },

  // b1 should be a player bubble, and b2 neutral bubbles
  CollisionScan: ( b1, b2 ) => {
    if( b1.class === "player" && b2.class === "neutral" ){
      if( Math.abs( ( b1.pos.x - b2.pos.x ) * ( b1.pos.x - b2.pos.x ) +
                    ( b1.pos.y - b2.pos.y ) * ( b1.pos.y - b2.pos.y ) )
                  < ( b1.rad + b2.rad ) * ( b1.rad + b2.rad ) ){
        if( b2.name === undefined ){
          b2.name = b1.name;
          b2.r = b1.r;
          b2.g = b1.g;
          b2.b = b1.b;
          b2.clr = compileColor( b1.r, b1.g, b1.b, NEUTRAL_ALPHA );
        }
      }
    }
  }
};
