const passport = require('passport');
const Parent = require('../models/Parent');
// const config = require('config');
require('dotenv').config();

passport.use(Parent.createStrategy());

const JwtStrategy = require('passport-jwt').Strategy;
const extractJwt = require('passport-jwt').ExtractJwt;

const jwtOptions = {
  jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const parent = await Parent.findById(jwt_payload.uid);

    if (parent) {
      return done(null, parent);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

module.exports = passport;