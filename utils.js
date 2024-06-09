// Reusable functions and methods for use elsewhere in app

// connection wrapper to get
function connectionWrapper() {
    console.log(filename,"placeholder");
}

function selectQuery(filename,sql,params = [],req,res) {
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


module.exports = {
    selectQuery
}