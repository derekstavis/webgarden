module.exports = (function () {
  function setup(app, db) {
    var session = require('express-session')
      , cookieParser = require('cookie-parser')
      , passport = require('passport')
      , Strategy = require('passport-local').Strategy
      , R = require('ramda');

    passport.serializeUser(function (user, done) {
      console.log('serializeUser(%s)', JSON.stringify(user));
      done(null, user.id)
    });

    passport.deserializeUser(function(userId, done) {
      console.log('deserializeUser(%s)', userId);
      db.users.find({ id: userId })
        .then(R.head)
        .then(o => {console.log('deserializeUser: %s', JSON.stringify(o)); return o})
        .then(R.partial(done, [null]))
        .catch(e => console.error('deserializeUser: %s', e));
    });

    passport.use(new Strategy(
      { usernameField: 'user', passwordField: 'pass' },
      function (user, pass, done) {
        db.users.find({ name: user })
          .then(R.head)
          .then(R.defaultTo(Promise.reject({ error: 'No such user!' })))
          .then(R.unless(R.propEq('pass', pass), R.F))
          .then(R.partial(done, [null]))
          .catch(R.partial(done, [null, false]));
      }
    ));

    app.use(cookieParser());
    app.use(session({
      resave: false,
      saveUninitialized: false,
      secret: 'keyboard cat'
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    return passport.authenticate('local');
  }

  function active(req, res, next) {
    req.isAuthenticated()
      ? next()
      : res.status(401).send({ error: 'Unauthenticated' });
  }

  return {
    setup: setup,
    active: active
  };

})();