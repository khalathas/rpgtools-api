const express = require('express');
const config = require('../config/config');
const system = express.Router();
//const config = require('../config/config');
//const db = require('../db');

system.get('/test', function(request, response) {
    response.send("Test success, api is listening - using path in system/test");
});
 
system.get('/tables', function(request, response) {
    var sql = 'show tables;';
    db.connect((err) => {
        if (err) throw err;
        console.log("DB Connected on port " + config.db.port);
        db.query(sql, function(err, result) {
            if (err) throw err;
            response.status(200).send(result);
        })
    });
})

    
system.get('/errortest/:errcode', function (request, response) {
    // in this endpoint we'll listen for what error they wish to return, and return that error code, ie: 200, 401, 403, 500, etc
    var error = request.params.errcode;
    response.status(error).send("Check devtools/network for appropriate error response");
})
    

module.exports = system;