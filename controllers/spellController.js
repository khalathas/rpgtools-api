const { log } = require('../utils/logger');
const path = require('path'); //add path module
const filename = path.basename(__filename); // for logging purposes
const spellModel = require('../models/spellModel');
const { successResponse, errorResponse } = require('../utils/dbUtils');

/* basic handler shape for all handlers - just change the model function that gets shoved into data
async function getAll(req, res) {
    const pool = req.app.locals.db;
    try {
        const data = await spellModel.getSpells(pool);
        if (!data.length) return res.status(404).json(errorResponse("NOT_FOUND", "No spells found"));
        res.json(successResponse(data, { count: data.length }));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}
*/

async function getAll(req, res) {
    const pool = req.app.locals.db;

    try {
        const {rows, total, page, page_size} = await spellModel.getSpells(pool, req.query);

        if (!rows.length) return res.status(404).json(errorResponse("NOT_FOUND", "No spells found"));
        res.json(successResponse(rows, {
            count: rows.length,
            page,
            page_size,
            total_count: total,
            total_pages: Math.ceil(total / page_size)
        }));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

async function getFacets(req, res) {
    const pool = req.app.locals.db;
    try {
        res.json(successResponse(await spellModel.getSpellFacets(pool)));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}


async function getById(req, res) {
    const pool = req.app.locals.db;
    const { id } = req.params;
    if (!id) return res.status(400).json(errorResponse("MISSING_ID", "ID parameter is required"));
    try {
        const data = await spellModel.getSpellById(pool, id);
        if (!data.length) return res.status(404).json(errorResponse("NOT_FOUND", "Spell not found"));
        res.json(successResponse(data[0]));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

async function getByField(req, res) {
    const pool = req.app.locals.db;
    const { field, value } = req.params;
    //should add whitelist for allowed fields in future
    if (!field || !value) return res.status(400).json(errorResponse("MISSING_PARAMS", "Field and value parameters are required"));
    try {
        const data = await spellModel.getSpellsByField(pool, field, value);
        if (!data.length) return res.status(404).json(errorResponse("NOT_FOUND", "No spells found"));
        res.json(successResponse(data, { count: data.length }));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

/* model stubs, not ready yet
async function getByClass(req, res) {
    const pool = req.app.locals.db;
    try {
        const data = await spellModel.getSpellsByClass(pool);
        if (!data.length) return res.status(404).json(errorResponse("NOT_FOUND", "No spells found"));
        res.json(successResponse(data, { count: data.length }));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

async function getByClassAndLevel(req, res) {
    const pool = req.app.locals.db;
    try {
        const data = await spellModel.getSpellsByClassAndLevel(pool);
        if (!data.length) return res.status(404).json(errorResponse("NOT_FOUND", "No spells found"));
        res.json(successResponse(data, { count: data.length }));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}
*/

/* future work - universal wrapper that takes function as parameter
async function handleSpellRequest(modelFn, params, message) {}
*/

module.exports = {
    getAll,
    getFacets,
    getById,
    getByField
}