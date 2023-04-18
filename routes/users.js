const express = require('express'),
    users = express.Router();
const config = require('../config/config');
const db = require('../db');

users.get('/test', function(request, response) {
    response.send("Test success, api is listening - using path in users/test");
});


users.get('/list', function(request, response) {
    let sql = 'SELECT * FROM users';
    db.query(sql, function(err, data, fields) {
        if (err) throw err;
        response.json({
            status: 200,
            data,
            message: "User lists retrieved successfully"
        })
    })
});

module.exports = users;