// Catch all for data that doesn't have enough endpoints to warrant its own model/controller.

const { log } = require('../utils/logger');
const path = require('path'); //add path module
const filename = path.basename(__filename); // for logging purposes
const referenceModel = require('../models/referenceModel');
const { successResponse, errorResponse } = require('../utils/dbUtils');

async function getAllSourceBooks(req, res) {
    const pool = req.app.locals.db;
    try {
        const data = await referenceModel.getSourceBooks(pool);
        if (!data.length) return res.status(404).json(errorResponse("NOT_FOUND", "No source books found"));
        res.json(successResponse(data, { count: data.length }));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}

async function getSourceBookById(req, res) {
    const pool = req.app.locals.db;
    const { id } = req.params;
    if (!id) return res.status(400).json(errorResponse("MISSING_ID", "ID parameter is required"));
    try {
        const data = await referenceModel.getSourceBookById(pool, id);
        if (!data.length) return res.status(404).json(errorResponse("NOT_FOUND", "Source book not found"));
        res.json(successResponse(data[0]));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse('DB_ERROR', 'Database error'));
    }
}


module.exports = {
    getAllSourceBooks,
    getSourceBookById
}