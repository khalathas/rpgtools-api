const express = require('express');
const srd = express.Router();
const filename = "srd.js"; // for logging purposes
//const config = require('../config/config');
//const db = require('../db');

srd.get('/classes', function(req, res) {
    var db = req.app.locals.db;

    let sql = 'SELECT c.id, c.name as "Name", b.name as "Sourcebook" FROM classes c left join sourceBooks b on c.sourcebook = b.id order by c.name asc';
    let preparedQuery = db.format(sql);
    db.query(preparedQuery, function(err, data, fields) {
        if (err) throw err;
        console.log(filename,": Class list route sent")
        res.json(data);
    });
});

srd.get('/spells', function(req, res) {
    var db = req.app.locals.db;

    // build sql statement with variable placeholders
    let sql = 'SELECT * FROM spells s';

    // format to protect against sql injection
    let preparedQuery = db.format(sql);

    db.query(preparedQuery, function(err, data, fields) {
        if (err) throw err;
        res.json(data);
    })
});

srd.get('/classbybookID/:bookID', function(req, res) {
    var db = req.app.locals.db;

    // store parameters in variables
    var bookID = req.params.bookID;

    // build sql statement with variable placeholders
    let sql = 'SELECT c.name as "Class", b.name as "Source Book" FROM classes c left join sourceBooks b on c.sourcebook = b.id where b.id = ? order by c.name asc';

    // format to protect against sql injection
    let preparedQuery = db.format(sql, [bookID]);

    db.query(preparedQuery, function(err, data, fields) {
        if (err) throw err;
        res.json(data);
    })
});

//get spell by ID
srd.get('/spellID/:spellID', function(req, res) {
    var db = req.app.locals.db;

    // store parameters in variables
    var spellID = req.params.spellID;

    // build sql statement with variable placeholders
    let sql = 'SELECT * FROM spells s where s.id = ?';

    // format to protect against sql injection
    let preparedQuery = db.format(sql, [spellID]);

    db.query(preparedQuery, function(err, data, fields) {
        if (err) throw err;
        res.json(data);
    })
});

//Single parameter spell search
srd.get('/spellsbyfield/:field/:value', function(req, res) {
    var db = req.app.locals.db;

  // store parameters in variables
    var field = req.params.field;
    var value = req.params.value;
    var values = [field, ['%' + value + '%']];
    

    // build sql statement with variable placeholders
    let sql = 'SELECT * FROM spells s where ?? LIKE ?';

    // format to protect against sql injection
    let preparedQuery = db.format(sql, values);

    db.query(preparedQuery, function(err, data, fields) {
        if (err) {
            res.send({
                _sql: sql,
                _values: values,
                _err: err
            })
            throw err;}
        console.log("Query: ",preparedQuery);
        res.json(data);
    })
});


// WIP add spells request endpoint, intended to take a json object of spell data, multiple spells
srd.post('/addSpells', function(request, response) {

    console.log("Add Spells endpoint invoked.");

    response.send("Add Spells endpoint invoked.");
});



module.exports = srd
