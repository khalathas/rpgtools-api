// Health check endpoint

const express = require('express');
const health = express.Router();
const path = require('path');
const filename = path.basename(__filename);

health.get('/health', function(req, res) {
    console.log(filename, ": Endpoint request: /api/health");

    const dbpool = req.app.locals.db;

    dbpool.getConnection(function(err, conn) {
        if (err) {
            console.log(filename, ": Database connection failed");
            return res.status(503).json({
                success: false,
                error: {
                    message: "Database connection failed",
                    code: "DB_CONNECTION_ERROR"
                }
            });
        }

        conn.release();
        console.log(filename, ": Health check passed");

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
