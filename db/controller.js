var Model = require('./config');

var createUser = function(req, res) {
  var user = new Model.User( 
  {
    name: String,
    email: String,
    access_token: String,
    refresh_token: String
  });

  user.save(function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log('cat was saved');
      res.end();
    }
  });
}


