const mysql = require('mysql'); //add mysql2 module
const path = require('path'); //add path module
const filename = path.basename(__filename); // for logging purposes


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
console.log(filename,": Connection Pool created");
return dbpool;
}

module.exports = {
    createPool
};