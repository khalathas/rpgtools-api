const { log } = require('../utils/logger');
const path = require('path'); //add path module
const filename = path.basename(__filename); // for logging purposes
const featModel = require('../models/featModel');
const { successResponse, errorResponse } = require('../utils/dbUtils');

async function getAll(req, res) {
    const pool = req.app.locals.db;
    try {
        const { rows, total, page, page_size } = await featModel.getFeats(pool, req.query);
        if (!rows.length) return res.status(404).json(errorResponse("NOT_FOUND", "No feats found"));
        res.json(successResponse(rows, {
            count: rows.length,
            page,
            page_size,
            total_count: total,
            total_pages: Math.ceil(total / page_size)
        }))
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

async function getFacets(req, res) {
    const pool = req.app.locals.db;
    try {
        res.json(successResponse(await featModel.getFeatFacets(pool)));
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
        const data = await featModel.getFeatById(pool, id);
        if (!data.length) return res.status(404).json(errorResponse("NOT_FOUND", "Feat not found"));
        res.json(successResponse(data[0]));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

async function create(req, res) {
    const pool = req.app.locals.db;
    const { name, source_book_id, benefit } = req.body;
    if (!name) return res.status(400).json(errorResponse("MISSING_NAME", "Name is required"));
    if (!source_book_id) return res.status(400).json(errorResponse("MISSING_SOURCE_BOOK", "Source Book ID is required"));
    if (!benefit) return res.status(400).json(errorResponse("MISSING_BENEFIT", "Benefit is required"));
    try {
        const result = await featModel.createFeat(pool, req.body);
        const newFeat = await featModel.getFeatById(pool, result.insertId);
        res.status(201).json(successResponse(newFeat[0]));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

async function getByType(req, res) {
    const pool = req.app.locals.db;
    const { type } = req.params;
    try {
        const data = await featModel.getFeatsByType(pool, type);
        if (!data.length) return res.status(404).json(errorResponse("NOT_FOUND", `No feats found for type: ${type}`));
        res.json(successResponse(data, { count: data.length }));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

async function updateById(req, res) {
    const pool = req.app.locals.db;
    const { id } = req.params;
    try {
        const result = await featModel.updateFeat(pool, id, req.body);
        if (!result.affectedRows) return res.status(404).json(errorResponse("NOT_FOUND", "Feat not found."));
        const updated = await featModel.getFeatById(pool, id);
        res.json(successResponse(updated[0]));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

async function deleteById(req, res) {
    const pool = req.app.locals.db;
    const { id } = req.params;
    try {
        const result = await featModel.deleteFeat(pool, id);
        if (!result.affectedRows) return res.status(404).json(errorResponse("NOT_FOUND", "Feat not found."));
        res.json(successResponse(null, { message: "Feat deleted successfully" }));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

async function addPrereq(req, res) {
    const pool = req.app.locals.db;
    const { id } = req.params;
    const { prereq_type } = req.body;
    if (!prereq_type) return res.status(400).json(errorResponse("MISSING_PREREQ_TYPE", "Prerequisite type is required"));
    try {
        const result = await featModel.createPrereq(pool, id, req.body);
        const row = await featModel.getPrereqById(pool, result.insertId);
        res.status(201).json(successResponse(row[0]));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

/* add/update prerequisite request body template:
{
  "prereq_type": "feat",
  "prereq_value": "Familiar",
  "prereq_min": null,
  "prereq_key": null,
  "prereq_feat_id": null,
  "prereq_skill_id": null
}
*/


async function updatePrereqById(req, res) {
    const pool = req.app.locals.db;
    const { id, prereqId } = req.params;
    try {
        const result = await featModel.updatePrereqById(pool, id, prereqId, req.body);
        if (!result.affectedRows) return res.status(404).json(errorResponse("PREREQ_NOT_FOUND", "Prerequisite not found."));
        const row = await featModel.getPrereqById(pool, prereqId);
        res.json(successResponse(row[0]));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}
    
async function deletePrereqById(req, res) {
    const pool = req.app.locals.db;
    const { id, prereqId } = req.params;
    try {
        const result = await featModel.deletePrereqById(pool, id, prereqId);
        if (!result.affectedRows) return res.status(404).json(errorResponse("PREREQ_NOT_FOUND", "Prerequisite not found."));
        res.json(successResponse(null, { message: "Prerequisite deleted successfully" }));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

module.exports = { 
    getAll,
    getFacets,
    getById,
    create,
    getByType,
    updateById,
    deleteById,
    addPrereq,
    updatePrereqById,
    deletePrereqById
}