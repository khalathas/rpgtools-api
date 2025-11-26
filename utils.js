const path = require('path');
const filename = path.basename(__filename); // for logging purposes

// Reusable functions and methods for use elsewhere in app

// connection wrapper to get
function connectionWrapper() {
    console.log(filename,"placeholder");
}

function selectQuery(filename,sql,params = [],req,res) {
    const dbpool = req.app.locals.db;
    dbpool.getConnection(function(err,conn) {
        if (err) {
            console.log(filename,": Connection Error!");
            throw err;
        }
        console.log(filename,": Connection Established");

        const preparedQuery = conn.format(sql, params);

        console.log(filename,": sendQuery function invoked, value passed: ",preparedQuery);

        // console.log(filename,": Sending query: ",preparedQuery);
        conn.query(preparedQuery, function(err, data, fields) {
            if (err) throw err;
            res.json(data);
            conn.release();
            console.log(filename,": Connection Released")
        });

    });

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
    selectQuery
}