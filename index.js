var db = require('./lib/db')
  , app = require('./lib/app');

db.connect()
  .then(app)
  .catch(e => console.error(e.stack));

