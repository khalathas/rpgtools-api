const mysql = require('mysql'); //add mysql2 module
const path = require('path'); //add path module
const filename = path.basename(__filename); // for logging purposes
const { log } = require('./utils.js'); //import log function from utils.js


function createPool(config) {

// new, connection pooling
const dbpool = mysql.createPool({
    connectionLimit : 10,
    host : config.db.host,
    user : config.db.user,
    port : config.db.port,
    password : config.db.pass,
    database : config.db.dbname
});
log(filename,": Connection Pool created");
return dbpool;
}

module.exports = {
    createPool
};