var express          = require( 'express' )
  , app              = express()
  , Model            = require( './db/config' )
  , server           = require( 'http' ).createServer( app )
  , passport         = require( 'passport' )
  , refresh          = require( 'passport-oauth2-refresh')
  , bodyParser       = require( 'body-parser' )
  , cookieParser     = require( 'cookie-parser' )
  , session          = require( 'express-session' )
  , RedisStore       = require( 'connect-redis' )( session )
  , handler          = require( './handler')
  , strategy         = require( './authStrategy');

var strategy = strategy.google;
passport.use(strategy);
refresh.use(strategy);
var PORT = process.env.PORT || 3000;
app.use( express.static(__dirname + '/public'));
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
  extended: true
}));

app.use( cookieParser('cookie_secret'));
app.use( session({
  secret: 'cookie_secret',
  name:   'backScratch',
  resave: false,
  saveUninitialized: false,
  store:  new RedisStore({
    host: 'redis',
    port: 6379
  })
}));

app.use( passport.initialize());
app.use( passport.session());


var ensureAuthenticated = (req, res, next ) => {
  if (req.isAuthenticated()) {
   return next();
 }
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

app.get('/verify', ensureAuthenticated, (req, res) => {
  res.status(200).json({id: req.user._id, name: req.user.name});
});

app.get('/connect/google', passport.authenticate( 'google', { scope: [
  'https://www.googleapis.com/auth/plus.profile.emails.read'],
   accessType: 'online',
   prompt: 'consent'
}))


app.get('/api/v1/auth/callback/google', passport.authenticate('google', { failureRedirect: '/#/sign-in' }),
  function(req, res) {
    res.redirect('/#/dashboard');
});

app.get('/logout', handler.logOut);
app.get('/token/gmail/:userId', handler.refresh);
app.get('/connected/gmail', handler.getUsers);
app.get('/dropTable', handler.dropTable);

server.listen( PORT );
console.log('listening on PORT', PORT);





