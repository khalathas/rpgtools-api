const express = require('express');
const users = express.Router();
const filename = "users.js"; // for logging purposes
//const config = require('../config/config');
//const db = require('../db');

users.get('/test', function(req, res) {
    res.send("Test success, api is listening - using path in users/test");
});


users.get('/list', function(req, res) {
    var db = req.app.locals.db;
    let sql = 'SELECT * FROM users';
    db.query(sql, function(err, data, fields) {
        if (err) throw err;
        res.json({
            status: 200,
            data,
            message: "User lists retrieved successfully"
        })
    })
});

module.exports = users;