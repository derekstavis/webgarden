module.exports = function (db) {
  var express = require('express')
    , bodyParser = require('body-parser')
    , logger = require('morgan')
    , auth = require('./config/auth')
    , R = require('ramda');

  var app = express();

  app.use(logger('dev'));
  app.use(bodyParser.json());

  var authorize = auth.setup(app, db);

  app.get('/v1/session', auth.active, function (req, res) {
    res.status(200).send(req.user);
  });

  app.post('/v1/session', authorize, function (req, res) {
    res.send(R.pickAll(['name', 'id'], req.user));
  });

  app.delete('/v1/session', auth.active, function (req, res) {
    req.logout();
    res.status(200).send({ 'message': 'Logged out' });
  });

  app.get('/v1/plants', auth.active, function (req, res) {
    db.plants.find()
      .then(R.bind(res.send, res))
      .catch(err => res.status(500).send(err));
  });

  app.post('/v1/plants', auth.active, function (req, res) {
    if (R.identical(R.keys(req.body), ['name'])) {
      db.plants.create(req.body)
        .then(() => res.status(201))
        .catch(err => res.status(500));
    }
  });

  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Application listening at http://%s:%s', host, port);
  });
};
