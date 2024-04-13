const express = require('express'),
    srd = express.Router();
const config = require('../config/config');
const db = require('../db');


srd.get('/classes', function(request, response) {

    let sql = 'SELECT c.id, c.name as "Name", b.name as "Sourcebook" FROM classes c left join sourceBooks b on c.sourcebook = b.id order by c.name asc';
    db.query(sql, function(err, data, fields) {
        if (err) throw err;
        response.json(data);
    });
});

srd.get('/spells', function(request, response) {

    // build sql statement with variable placeholders
    let sql = 'SELECT * FROM spells s';

    // format to protect against sql injection
    let preparedQuery = db.format(sql);

    db.query(sql, function(err, data, fields) {
        if (err) throw err;
        response.json(data);
    })
});

srd.get('/classbybookID/:bookID', function(request, response) {

    // store parameters in variables
    var bookID = request.params.bookID;

    // build sql statement with variable placeholders
    let sql = 'SELECT c.name as "Class", b.name as "Source Book" FROM classes c left join sourceBooks b on c.sourcebook = b.id where b.id = ? order by c.name asc';

    // format to protect against sql injection
    let preparedQuery = db.format(sql, [bookID]);

    db.query(preparedQuery, function(err, data, fields) {
        if (err) throw err;
        response.json(data);
    })
});

//get spell by ID
srd.get('/spellID/:spellID', function(request, response) {

    // store parameters in variables
    var spellID = request.params.spellID;

    // build sql statement with variable placeholders
    let sql = 'SELECT * FROM spells s where s.id = ?';

    // format to protect against sql injection
    let preparedQuery = db.format(sql, [spellID]);

    db.query(preparedQuery, function(err, data, fields) {
        if (err) throw err;
        response.json(data);
    })
});

//Single parameter spell search
srd.get('/:field/:value', function(request, response) {

    // store parameters in variables
    var param = request.params.field
    var value = request.params.value;
    var whereFilter = [param, value];

    // build sql statement with variable placeholders
    let sql = 'SELECT * FROM spells s where s.? = ?';

    // format to protect against sql injection
    let preparedQuery = db.format(sql, filter);

    db.query(preparedQuery, function(err, data, fields) {
        if (err) throw err;
        response.json(data);
    })
});


// WIP add spells request endpoint, intended to take a json object of spell data, multiple spells
srd.post('/addSpells', function(request, response) {

    console.log("Add Spells endpoint invoked.");

    response.send("Add Spells endpoint invoked.");
});

// Scratchpad POST endpoint to experiment with.  Columns are ID (autoincrement), name (varchar 50), comment (varchar 50)

srd.post('/scratchpad', function(request, response) {

    let body = request.body;

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
        response.json({
            status: 200,
            message: "Data inserted successfully"
        })

    });

});


// Truncate scratchpad to start over

srd.post('/clearscratch', function(request, response) {

    let sql = 'TRUNCATE TABLE scratchpad';

    db.query(sql, function(err, result) {
        if (err) throw err;
        response.send(200);
    });

});


module.exports = srd;