/* --Model Module-- */

  // Constants
  const PLAYER_RADIUS = 0.05;

class Bubble{
  constructor( _rad, _coord, _clr ){
    // Constraints, values between 0 - 1 as floats
    this.rad = _rad;

    // Physics, values between 0 - 1 as floats
    this.pos = { x: _coord.x, y: _coord.y };
    this.vel = { x: 0,     y: 0 };
    this.acl = { x: 0,     y: 0 };

    // Draw Data
    this.clr = _clr;

    // Mechanical
    this.draw = true;
  }
};

class PlayerBubble extends Bubble{
  constructor( _socket ){
    super( PLAYER_RADIUS, { x: 0.5, y: 0.5 }, "rgba( 255, 0, 0, 0.5 )" );
  }
};

class NeutralBubble extends Bubble{
  constructor(){
    super( PLAYER_RADIUS, { x: Math.random(), y: Math.random() }, "rgba( 128, 128, 128, 0.5 )" );
  }
};

module.exports = {
  Bubble: Bubble,
  PlayerBubble: PlayerBubble,
  NeutralBubble: NeutralBubble
};
