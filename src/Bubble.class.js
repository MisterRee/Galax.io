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
    this.scan = true; // TODO: 'scan' is not descriptive enough
  }

  draw( _ctx, _cvsw, _cvsh ){
    _ctx.fillstyle = this.clr;
    _ctx.beginPath();
    _ctx.ellipse(
      this.pos.x * _cvsw,
      this.pos.y * _cvsh,
      this.rad * _cvsw,
      this.rad * _cvsh,
      0, 0, Math.PI * 2 );
    _ctx.fill();
    return;
  }
};

class PlayerBubble extends Bubble{
  constructor( _skt ){
    super( PLAYER_RADIUS, { x: 0.5, y: 0.5 }, "rgba( 255, 0, 0, 0.5 )" );
  }

  draw( _ctx, _cvsw, _cvsh ){
    return super.draw( _ctx, _cvsw, _cvsh );
  }
};

class NeutralBubble extends Bubble{
  constructor(){
    super( PLAYER_RADIUS, { x: Math.random(), y: Math.random() }, "rgba( 128, 128, 128, 0.5 )" );
  }

  draw( _ctx, _cvsw, _cvsh ){
    return super.draw( _ctx, _cvsw, _cvsh );
  }
};

module.exports = {
  Bubble: Bubble,
  PlayerBubble: PlayerBubble,
  NeutralBubble: NeutralBubble
};
