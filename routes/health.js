// Health check endpoint

const express = require('express');
const health = express.Router();
const path = require('path');
const filename = path.basename(__filename);
const { log } = require('../utils.js'); //import log function from utils.js

health.get('/health', function(req, res) {
    log(filename, ": Endpoint request: /api/health");

    const dbpool = req.app.locals.db;

    dbpool.getConnection(function(err, conn) {
        if (err) {
            log(filename, ": Database connection failed");
            return res.status(503).json({
                success: false,
                error: {
                    message: "Database connection failed",
                    code: "DB_CONNECTION_ERROR"
                }
            });
        }

        conn.release();
        log(filename, ": Health check passed");

        res.json({
            success: true,
            data: {
                status: "ok",
                timestamp: new Date().toISOString(),
                database: "connected"
            }
        });
    });
});

module.exports = health;
