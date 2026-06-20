const { log } = require('../utils/logger');
const path = require('path');
const filename = path.basename(__filename);
const adminModel = require('../models/adminModel');
const { successResponse, errorResponse } = require('../utils/dbUtils');

async function getUsers(req, res) {
    const { page, perPage, query } = req.query;

    try {
        const data = await adminModel.getUsers(page, perPage, query);
        res.json(successResponse(data));
    } catch (err) {
        log(filename, err);
        res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch users"));
    }
}

async function assignRole(req, res) {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) return res.status(400).json(errorResponse("MISSING_PARAMETERS", "role is required"));

    try {
        const data = await adminModel.assignUserRole(userId, role);
        res.json(successResponse(data));
    } catch (err) {
        log(filename, err);
        res.status(err.status ?? 500).json(errorResponse(err.code ?? "INTERNAL_SERVER_ERROR", err.message));
    }
}

async function removeRole(req, res) {
    const { userId, role } = req.params;

    try {
        const data = await adminModel.removeUserRole(userId, role);
        res.json(successResponse(data));
    } catch (err) {
        log(filename, err);
        res.status(err.status ?? 500).json(errorResponse(err.code ?? "INTERNAL_SERVER_ERROR", err.message));
    }
}

module.exports = { 
    getUsers,
    assignRole,
    removeRole
}