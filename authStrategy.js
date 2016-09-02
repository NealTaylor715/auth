var passport         = require( 'passport' );
var GoogleStrategy   = require( 'passport-google-oauth20' ).Strategy;
var Model            = require( './db/config' );
var clientID         = process.env.GMAIL_CLIENT_ID;
var clientSecret     = process.env.GMAIL_CLIENT_SECRET;

module.exports = {
  google: new GoogleStrategy({
    clientID:     clientID,
    clientSecret: clientSecret,
    callbackURL:  process.env.WEBSERVER_URL + '/api/v1/auth/callback/google',
    passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
      var userId = profile.emails[0].value;
      console.log('Google profile name', profile.displayName);
      Model.User.findOrCreate({name: profile.displayName , email: userId}, {access_token: accessToken, refresh_token: refreshToken},
      function(err, user, created) {
        if (err) {
          console.log('Error is', err);
          done(err, null);
        } else {
          console.log('User from Mongo. Email:', user.email);
          console.log('Created from Mongo?', created);
          done(null,user,created);
        }
      });
    }
  )
}  
