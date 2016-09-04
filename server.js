var express          = require( 'express' );
var app              = express();
var Model            = require( './db/config' );
var passport         = require( 'passport' );
var refresh          = require( 'passport-oauth2-refresh');
var bodyParser       = require( 'body-parser' );
var cookieParser     = require( 'cookie-parser' );
var session          = require( 'express-session' );
var RedisStore       = require( 'connect-redis' )( session );
var handler          = require( './handler');
var strategy         = require( './authStrategy');

var strategy = strategy.google;
var PORT = process.env.PORT || 3000;
var rHost = process.env.REDIS_HOST;
var rPort = process.env.REDIS_PORT;

passport.use(strategy);
refresh.use(strategy);
app.use( express.static(__dirname + '/public'));
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
  extended: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use( require('morgan')('dev') );
}

app.use( cookieParser('cookie_secret'));
app.use( session({
  secret: 'cookie_secret',
  name:   'backScratch',
  resave: false,
  saveUninitialized: false,
  store:  new RedisStore({
    host: rHost,
    port: rPort
  })
}));

app.use( passport.initialize());
app.use( passport.session());

var ensureAuthenticated = function(req, res, next ) {
  if (req.isAuthenticated()) {
   console.log('User authenticated!');
   return next();
 }
  console.log('User is not authenticated');
  res.status(401).json({message: '401'});
};

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  Model.User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get('/api/v1/success', function(req, res) {
  res.redirect(process.env.PROXY_SUCCESS_URL);
});

app.get('/', function(req, res) {
  res.send('Hey, you made it.. Now what?');
});

app.get('/verify', ensureAuthenticated, function(req, res) {
  res.status(200).json({id: req.user._id, name: req.user.name});
});

app.get('/connect/google', passport.authenticate( 'google', { scope: [
  'https://www.googleapis.com/auth/plus.profile.emails.read'],
   accessType: 'online',
   prompt: 'consent'
}));

app.get('/api/v1/auth/callback/google', passport.authenticate('google', { failureRedirect: process.env.AUTH_FAILURE_PATH }),
  function(req, res) { 
    res.redirect(process.env.AUTH_SUCCESS_PATH);
});

app.get('/logout', handler.logOut);
app.get('/token/gmail/:userId', handler.refresh);
app.get('/connected/gmail', handler.getUsers);
app.get('/dropTable', handler.dropTable);

app.listen(PORT, function() {
  console.log('Listening on PORT:', PORT);
});