/* --Model Module-- */

module.exports = class Bubble{
  constructor( _dimens, _coord, _clr ){
    // Constraints, values between 0 - 1 as floats
    this.rad = { x: _dimens.x, y: _dimens.y };

    // Physics, values between 0 - 1 as floats
    this.pos = { x: _coord.x, y: _coord.y };
    this.vel = { x: 0,     y: 0 };
    this.acl = { x: 0,     y: 0 };

    // Draw Data
    this.clr = _clr;
  }
};
