const express = require('express');
const config = require('../config/config');
const system = express.Router();
//const config = require('../config/config');
//const db = require('../db');

system.get('/test', function(req, res) {
    res.send("Test success, api is listening - using path in system/test");
});

system.get('/tables', function(req, res) {
    var db = req.app.locals.db;
    var sql = 'show tables;';
    db.connect((err) => {
        if (err) throw err;
        console.log("DB Connected on port " + config.db.port);
        db.query(sql, function(err, result) {
            if (err) throw err;
            res.status(200).send(result);
        })
    });
})

    
system.get('/errortest/:errcode', function (req, res) {
    // in this endpoint we'll listen for what error they wish to return, and return that error code, ie: 200, 401, 403, 500, etc
    var error = req.params.errcode;
    res.status(error).send("Check devtools/network for appropriate error response");
})
    

module.exports = system;