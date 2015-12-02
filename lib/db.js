module.exports = (function () {
  var mysql = require('mysql')
    , R = require('ramda');

  var config = {
    socketPath: '/tmp/mysql.sock',
    user      : 'root',
    password  : '',
    database  : 'garden'
  };

  function Garden(sql) {
    return {
      plants: {
        find: R.partial(find, [sql, 'plants']),
        create: R.partial(create, [sql, 'plants']),
        destroy: R.partial(destroy, [sql, 'plants'])
      },
      users: {
        find: R.partial(find, [sql, 'users'])
      }
    }
  }

  function connect() {
    return new Promise(function (resolve, reject) {
      var connection = mysql.createConnection(config);
      connection.connect();
      resolve(Garden(connection));
    });
  }

  var optionMap = { limit: 'LIMIT', order: 'ORDER BY' };

  function mapOptions(options) {
    return R.join(' ', R.flatten([
      R.map(function(opt) {
        return R.has(opt, optionMap)
          ? R.join(' ', [optionMap[opt], options[opt]])
          : [];
        },
        R.keys(options))
    ]));
  }

  function selectAll(from, query, options) {
    return R.join(' ', R.flatten([
      'SELECT * FROM', from, query
        ? 'WHERE ' + R.join(' ', R.map(
          k => R.join('', ["`", k, "` = '", query[k], "'"]),
          R.keys(query)))
        : [],
      options
        ? mapOptions(options)
        : []
    ]));
  }

  function find(sql, from, query, options) {
    return new Promise(function (resolve, reject) {
      sql.query(selectAll(from, query, options), function(err, rows) {
        err ? reject(err) : resolve(rows);
      });
    });
  }

  function create(sql, into, plant) {
    return new Promise(function (resolve, reject) {
      sql.query('INSERT INTO ' + into + ' SET ?', plant, function(err, res) {
        err ? reject(err) : resolve(res);
      });
    });
  }

  function destroy(sql, from, query) {
    if (!query) return Promise.reject(new Error('Deleting without paramers!'));

    return new Promise(function (resolve, reject) {
      sql.query('DELETE FROM ' + from + ' WHERE ?', query, function(err, res) {
        err ? reject(err) : resolve(res);
      });
    });
  }

  return {
    connect: connect
  };

})();
