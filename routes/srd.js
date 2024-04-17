const express = require('express');
const config = require('../config/config');
const srd = express.Router();
//const config = require('../config/config');
//const db = require('../db');

srd.get('/classes', function(req, res) {
    var db = req.app.locals.db;

    let sql = 'SELECT c.id, c.name as "Name", b.name as "Sourcebook" FROM classes c left join sourceBooks b on c.sourcebook = b.id order by c.name asc';
    db.query(sql, function(err, data, fields) {
        if (err) throw err;
        res.json(data);
    });
});

srd.get('/spells', function(req, res) {
    var db = req.app.locals.db;

    // build sql statement with variable placeholders
    let sql = 'SELECT * FROM spells s';

    // format to protect against sql injection
    let preparedQuery = db.format(sql);

    db.query(sql, function(err, data, fields) {
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

// WIP add spells req endpoint, intended to take a json object of spell data, multiple spells
srd.post('/addSpells', function(req, res) {
    var db = req.app.locals.db;

    console.log("Add Spells endpoint invoked.");

    res.send("Add Spells endpoint invoked.");
});



module.exports = srd