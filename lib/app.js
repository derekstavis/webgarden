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

  var handleError = R.curry(function (res, err) {
    res.status(500).send({ error: err.message });
  });

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
    db.plants.find({ user_id: req.user.id })
      .then(R.bind(res.send, res))
      .catch(handleError(res));
  });

  app.get('/v1/plants/:id', auth.active, function (req, res) {
    db.plants.find({ id: req.params.id })
      .then(R.head)
      .then(R.bind(res.send, res))
      .catch(handleError(res));
  });

  app.delete('/v1/plants/:id', auth.active, function (req, res) {
    db.plants.destroy({ id: req.params.id })
      .then(R.bind(res.send, res))
      .catch(handleError(res));
  });

  app.get('/v1/plants/:id/reports', auth.active, function (req, res) {
    db.reports.find(
      { plant_id: req.params.id },
      { order: 'read_at DESC' }
    )
      .then(R.bind(res.send, res))
      .catch(handleError(res));
  });

  app.post('/v1/plants/:id/reports', function (req, res) {
    var report = R.pickAll(['name', 'value'], req.body);
    var meta = { plant_id: req.params.id, read_at: new Date() };
    if (R.equals(R.keys(report), ['name', 'value'])) {
      db.reports.create(R.merge(meta, report))
        .then(r => res.status(200).send({}))
        .catch(handleError(res));
    } else {
      res.status(400).send({ error: "Bad request" });
    }
  });

  app.post('/v1/plants', auth.active, function (req, res) {
    var plant = R.pickAll(['name'], req.body);
    if (R.equals(R.keys(plant), ['name'])) {
      db.plants.create(R.assoc('user_id', req.user.id, plant))
        .then(r => res.status(201).send(R.assoc('id', r.insertId, plant)))
        .catch(handleError(res));
    } else {
      res.status(400).send({ error: "Bad request" });
    }
  });

  app.get('/v1/status', function (req, res) {
    res.status(200).send('OK')
  })

  var server = app.listen(process.env.PORT, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Application listening at http://%s:%s', host, port);
  });
};
