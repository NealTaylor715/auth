var passport         = require( 'passport' );
var GoogleStrategy   = require( 'passport-google-oauth20' ).Strategy;
var Model            = require( './db/config' );
var clientID         = process.env.GMAIL_CLIENT_ID;
var clientSecret     = process.env.GMAIL_CLIENT_SECRET;

module.exports = {
  google: new GoogleStrategy({
    clientID:     clientID,
    clientSecret: clientSecret,
    callbackURL: process.env.WEBSERVER_URL + '/api/v1/auth/connect/callback/google',
    passReqToCallback: true
    },
    (request, accessToken, refreshToken, profile, done) => {
      var userId = profile.emails[0].value;
      Model.User.findOrCreate({name: profile.displayName , email: userId}, {access_token: accessToken, refresh_token: refreshToken},
      (err, user, created) => {
        if (err) {
          console.log('err is', err);
          done(err, null);
        } else {
          console.log('user is from Mongo', user);
          console.log('created from Mongo is', created);
          done(null,user,created);
        }
      });
    }
  )
}  







