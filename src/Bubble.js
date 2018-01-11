/* --Model Module-- */

  // Helper Math Extension
  Math.GenerateRandomWithinDomain = ( min, max ) => {
    return Math.random() * ( max - min ) + min;
  }

  const compileColor = ( _r, _g, _b, _a ) => {
    return "rgba(" + _r + "," + _g + "," + _b + "," + _a + ")";
  }

  // Dependencies
  const Victor = require( 'victor' );

  // Game Constants
  const PLAYER_MAX_MOUSE_DISTANCE_FORCE_RATIO = 0.4;
  const PLAYER_FORCE_COEFFICIENT = 0;
  const PLAYER_MAX_VELOCITY = 0.25;
  const PLAYER_MAX_FORCE = 0.000005;

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
  this.vel = new Victor( 0, 0 );
  this.frc = new Victor( 0, 0 );

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
    temp.mPos = { x: 0, y: 0 };
    return temp;
  },

  PlayerCycle: ( pBubble, time ) => {
    if( !pBubble.mPos || pBubble.disable ){
      return;
    }

    let tempM = new Victor( pBubble.mPos.x, pBubble.mPos.y );
    let tempB = new Victor( pBubble.pos.x, pBubble.pos.y );
    tempB.subtract( tempM );

    if( tempB.length() > PLAYER_MAX_MOUSE_DISTANCE_FORCE_RATIO ){
      tempB.normalize();
    } else {
      tempB.divide( new Victor( PLAYER_MAX_MOUSE_DISTANCE_FORCE_RATIO, PLAYER_MAX_MOUSE_DISTANCE_FORCE_RATIO ) );
    }

    // NOTE multiply this by a determined c
    tempB.divide( new Victor( time, time ) );

    pBubble.frc.add( tempB );
    if( pBubble.frc.length() > PLAYER_MAX_FORCE ){
      pBubble.frc.normalize().multiply( new Victor( PLAYER_MAX_FORCE, PLAYER_MAX_FORCE ) );
    }

    pBubble.vel.subtract( pBubble.frc );
    if( pBubble.vel.length() > PLAYER_MAX_VELOCITY ){
      pBubble.vel.normalize().multiply( new Victor( PLAYER_MAX_VELOCITY, PLAYER_MAX_VELOCITY ) );
    }

    pBubble.pos.x += pBubble.vel.x * time;
    pBubble.pos.y += pBubble.vel.y * time;

    if( pBubble.pos.x < 0 ||
        pBubble.pos.x > 1 ||
        pBubble.pos.y < 0 ||
        pBubble.pos.y > 1 ){
      pBubble.pos = { x: 0.5, y: 0.5 };
    }
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
