const mysql = require('mysql2/promise');
const config = require('./config.json');

const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  connectionLimit: config.connectionLimit, 
  enableKeepAlive: config.enableKeepAlive,
  keepAliveInitialDelay: config.keepAliveInitialDelay
});

module.exports = pool;