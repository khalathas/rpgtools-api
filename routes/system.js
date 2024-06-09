// System routes, mostly for testing purposes, can likely delete, disable, or
// lock these behind auth later when app is more fleshed out

const express = require('express');
const system = express.Router();
const { selectQuery } = require('../utils.js');
const filename = "system.js"; // for logging purposes

system.get('/test', function(req, res) {
    res.send("Test success, api is listening - using path in system/test");
});

system.get('/tables', function(req, res) {
    console.log(filename,": Endpoint request: /system/tables");

    const sql = 'show tables;';
    const params = [];

    selectQuery(filename,sql,params,req,res);
})

//scratchpad can be rewritten as srd.route('/scratchpad').get((req,res) => {}).post((req,res) => {});
/*
system.post('/scratchpad', function(req, res) {
    const db = req.app.locals.db;

    const body = req.body;

    // build the values
    const values = [];
    for(let i=0; i< body.length; i++)
    values.push([body[i].name,body[i].comment]);

    // build sql statement, format to offer some protection against sql injection
    const sql = 'INSERT INTO scratchpad (name, comment) VALUES ?';
    const preparedQuery = db.format(sql, [values]);

    // build query execution
    db.query(sql, function(err, result) {
        if (err) throw err;
        res.json({
            status: 200,
            message: "Data inserted successfully"
        })

    });

});
*/

// Truncate scratchpad to start over

/*
system.post('/clearscratch', function(req, res) {
    const db = req.app.locals.db;

    const sql = 'TRUNCATE TABLE scratchpad';

    db.query(sql, function(err, result) {
        if (err) throw err;
        res.send(200);
    });

});
*/

system.get('/scratchpad', function(req, res) {
    console.log(filename,": Endpoint request: /system/scratchpad");
    
    // build sql statement with variable placeholders
    const sql = 'SELECT * FROM scratchpad s';
    params = [];

    selectQuery(filename,sql,params,req,res);
});

module.exports = system;
