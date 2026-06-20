// admin endpoints

const express = require('express');
const admin = express.Router();
const adminController = require('../controllers/adminController.js');

const { createRequireAuth, requireRole, requireMinRole } = require('@axiom/aegis');
const requireAuth = createRequireAuth({
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
});

admin.use(requireAuth);
admin.use(requireMinRole('Admin')); // all routes in this router require admin role 

admin.route('/users')
    .get(adminController.getUsers)

admin.route('/users/:userId/roles')
    .post(requireRole('Owner'), adminController.assignRole)

admin.route('/users/:userId/roles/:role')
    .delete(requireRole('Owner'), adminController.removeRole);

module.exports = admin;
