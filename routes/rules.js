// Main routes file for rules specific endpoints

const express = require('express');
const rules = express.Router();
const spellController = require('../controllers/spellController.js');
const classController = require('../controllers/classController.js');
const featController = require('../controllers/featController.js');
const skillController = require('../controllers/skillController.js');
const referenceController = require('../controllers/referenceController.js');

// Spell routes
rules.route('/spells')
    .get(spellController.getAll);

rules.route('/spells/facets')
    .get(spellController.getFacets);

rules.route('/spells/:id')
    .get(spellController.getById);

rules.route('/spells/field/:field/:value')
    .get(spellController.getByField);

// rules.route('/spells/class/:className') // not ready yet

// rules.route('/spells/class/:className/level/:level') // not ready yet

// Class routes
rules.route('/classes')
    .get(classController.getAll);

rules.route('/classes/book/:bookId')
    .get(classController.getByBookId);

// Feat routes
rules.route('/feats')
    .get(featController.getAll)
    .post(featController.create);

rules.route('/feats/type/:type')
    .get(featController.getByType);

rules.route('/feats/facets')
    .get(featController.getFacets);

rules.route('/feats/:id')
    .get(featController.getById)
    .patch(featController.updateById)
    .delete(featController.deleteById);

rules.route('/feats/:id/prereqs')
    .post(featController.addPrereq);

rules.route('/feats/:id/prereqs/:prereqId')
    .patch(featController.updatePrereqById)
    .delete(featController.deletePrereqById);

// Skill routes
rules.route('/skills')
    .get(skillController.getAll);

rules.route('/skills/:id')
    .get(skillController.getById);

// Book routes
rules.route('/sourcebooks')
    .get(referenceController.getAllSourceBooks);

rules.route('/sourcebooks/:id')
    .get(referenceController.getSourceBookById);

module.exports = rules