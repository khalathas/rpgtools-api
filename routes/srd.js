// Main routes file for SRD specific endpoints

const express = require('express');
const { selectQuery } = require('../utils.js');
const srd = express.Router();
const filename = "srd.js"; // for logging purposes


srd.get('/classes', function(req, res) {
    console.log(filename,": Endpoint request: /srd/classes");

    // build sql statement with variable placeholders
    const sql = 'SELECT c.id, c.name as "Name", b.name as "Sourcebook" FROM classes c left join sourceBooks b on c.sourcebook = b.id order by c.name asc';
    const params = [];

    //send query to select function
    selectQuery(filename,sql,params,req,res);
});

srd.get('/spells', function(req, res) {
    console.log(filename,": Endpoint request: /srd/spells");

    // build sql statement with variable placeholders
    const sql = 'SELECT * FROM spells s';
    const params = [];

    selectQuery(filename,sql,params,req,res);
});

srd.get('/classbybookID/:bookID', function(req, res) {
    console.log(filename,": Endpoint request: /srd/classbybookID");

    // store parameters in variables
    const bookID = req.params.bookID;

    // build sql statement with variable placeholders
    const sql = 'SELECT c.name as "Class", b.name as "Source Book" FROM classes c left join sourceBooks b on c.sourcebook = b.id where b.id = ? order by c.name asc';
    const params = [bookID];

    selectQuery(filename,sql,params,req,res);
});

//get spell by ID
srd.get('/spellID/:spellID', function(req, res) {
    console.log(filename,": Endpoint request: /srd/spellID");

    // store parameters in variables
    const spellID = req.params.spellID;

    // build sql statement with variable placeholders
    const sql = 'SELECT * FROM spells s where s.id = ?';
    const params = [spellID];

    selectQuery(filename,sql,params,req,res);
});

//Single parameter spell search
srd.get('/spellsbyfield/:field/:value', function(req, res) {
    console.log(filename,": Endpoint request: /srd/spellsbyfield");

  // store parameters in variables
    const field = req.params.field;
    const value = req.params.value;
    const params = [field, ['%' + value + '%']];
    

    // build sql statement with variable placeholders
    const sql = 'SELECT * FROM spells s where ?? LIKE ?';

    selectQuery(filename,sql,params,req,res);
});


// WIP add spells request endpoint, intended to take a json object of spell data, multiple spells
srd.post('/addSpells', function(req, res) {

    console.log("Add Spells endpoint invoked.");

    res.send("Add Spells endpoint invoked.");
});



module.exports = srd
