module.exports = function (db) {
  var express = require('express')
    , bodyParser = require('body-parser')
    , logger = require('morgan')
    , cors = require('cors')
    , auth = require('./config/auth')
    , R = require('ramda');

  var app = express();

  var corsPolicy = cors({
    origin: true,
    credentials: true
  });

  app.use(logger('dev'));
  app.use(corsPolicy);
  app.use(bodyParser.json());

  var authorize = auth.setup(app, db);

  app.options('*', corsPolicy);

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
    var plant = R.pickAll(['name'], req.body);
    if (R.equals(R.keys(plant), ['name'])) {
      db.plants.create(req.body)
        .then(r => res.status(201).send(R.assoc('id', r.insertId, plant)))
        .catch(err => res.status(500).send({ error: 'Internal error' }));
    }
  });

  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Application listening at http://%s:%s', host, port);
  });
};
