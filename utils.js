const path = require('path');
const filename = path.basename(__filename); // for logging purposes

// Reusable functions and methods for use elsewhere in app

function selectQuery(filename,sql,params = [],req,res) {
    const dbpool = req.app.locals.db;
    dbpool.getConnection(function(err,conn) {
        if (err) {
            log(filename,": Connection Error!");
            throw err;
        }
        log(filename,": Connection Established");

        const preparedQuery = conn.format(sql, params);

        log(filename,": sendQuery function invoked, value passed: ",preparedQuery);

        conn.query(preparedQuery, function(err, data, fields) {
            if (err) throw err;
            res.json(data);
            conn.release();
            log(filename,": Connection Released")
        });

    });

}

function log(...args) {
    if (process.env.NODE_ENV !== 'production') console.log(...args);
}

/* Placeholders
function insertQuery() {

}

function updateQuery() {

}

function deleteQuery() {

}
*/

module.exports = {
    selectQuery, log
}