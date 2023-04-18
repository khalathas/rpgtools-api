const ConnectRoles = require('connect-roles');

// Create a new instance of ConnectRoles
const roles = new ConnectRoles();

// Define your roles
roles.use('admin', (req) => {
  return req.user && req.user.role === 'admin';
});

roles.use('user', (req) => {
  return req.user && req.user.role === 'user';
});

module.exports = roles;
