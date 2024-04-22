const express = require('express');
const system = express.Router();
const filename = "system.js"; // for logging purposes

system.get('/test', function(req, res) {
    res.send("Test success, api is listening - using path in system/test");
});

system.get('/tables', function(req, res) {
    const db = req.app.locals.db;
    let sql = 'show tables;';
    db.connect((err) => {
        if (err) throw err;
        console.log("DB Connected on port " + config.db.port);
        db.query(sql, function(err, result) {
            if (err) throw err;
            res.status(200).send(result);
        })
    });
})

//scratchpad can be rewritten as srd.route('/scratchpad').get((req,res) => {}).post((req,res) => {});
system.post('/scratchpad', function(req, res) {
    const db = req.app.locals.db;

    let body = req.body;

    // build the values
    var values = [];
    for(var i=0; i< body.length; i++)
    values.push([body[i].name,body[i].comment]);

    // build sql statement, format to offer some protection against sql injection
    let sql = 'INSERT INTO scratchpad (name, comment) VALUES ?';
    let preparedQuery = db.format(sql, [values]);

    // build query execution
    db.query(sql, function(err, result) {
        if (err) throw err;
        res.json({
            status: 200,
            message: "Data inserted successfully"
        })

    });

});


// Truncate scratchpad to start over

system.post('/clearscratch', function(req, res) {
    const db = req.app.locals.db;

    let sql = 'TRUNCATE TABLE scratchpad';

    db.query(sql, function(err, result) {
        if (err) throw err;
        res.send(200);
    });

});

system.get('/scratchpad', function(req, res) {
    const db = req.app.locals.db;

    // build sql statement with variable placeholders
    let sql = 'SELECT * FROM spells s';

    // format to protect against sql injection
    let preparedQuery = db.format(sql);

    db.query(sql, function(err, data, fields) {
        if (err) throw err;
        res.json(data);
    })
});

    
system.get('/errortest/:errcode', function (req, res) {
    // in this endpoint we'll listen for what error they wish to return, and return that error code, ie: 200, 401, 403, 500, etc
    var error = req.params.errcode;
    res.status(error).send("Check devtools/network for appropriate error response");
})
    

module.exports = system;
