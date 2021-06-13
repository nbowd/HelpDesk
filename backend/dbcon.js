var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : '127.0.0.1',
  port            : '8889',
  user            : 'root',
  password        : '1234',
  database        : 'help_desk',
  dateStrings     : 'true',  // This allows the date to be in the correct format
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});

module.exports.pool = pool;