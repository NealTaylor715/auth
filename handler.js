var Model    = require('./db/config');
var refresh  = require('passport-oauth2-refresh');

module.exports = {
  refresh: function(req, res) {
    var id = req.params.userId;
    Model.User.findOne({_id: id})
      .then(function(result) {
        refresh.requestNewAccessToken('google', result.refresh_token, 
        function(err, accessToken, refreshToken) {  
        res.json({accessToken: accessToken});
        })
      })
      .catch(function(err) {
        res.send('no token available');
      });
  },
  getUsers: function(req, res) {
    var users = [];
    Model.User.find({})
    .then(function(result) {
      result.forEach(function(value) {
        if (!!value.refresh_token) users.push(value._id);
      });
      res.json(users);
    })
    .catch(function(err) {
      res.send('err in finding user');
    });
  },
  logOut: function(req, res) {
    req.session.destroy(function() {
      res.redirect('/#/');
    });
  },
  dropTable: function(req, res) {
    Model.User.remove(function(err, result) {
      if (err) {
        console.log('err is', err);
      } else {
        console.log('result is', result);
      }
    });
    res.send('table dropped');
  }
}
