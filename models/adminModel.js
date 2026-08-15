const { getRoleMap, listUsers, getUserRoles, assignRole, removeRole, getRoleUsers } = require('../services/auth0Management');
const { ROLES } = require('@axiom/aegis');

async function getUsers(page, perPage, query) {

    const result = await listUsers(page, perPage, query);

    const users = await Promise.all(
    result.users.map(async (user) => {
        const roles = await getUserRoles(user.user_id);
        return {
            user_id: user.user_id,
            email:   user.email,
            name:    user.name,
            picture: user.picture,
            roles:   roles.map(r => r.name),
        };
    }));

    return {
        users,
        page:    result.start / result.limit + 1,
        perPage: result.limit,
        total:   result.total,
    };
}

async function assignUserRole(targetUserId, roleName) {
    const assignableRoles = Object.keys(ROLES);
    if (!assignableRoles.includes(roleName)) {
        const err = new Error(`Invalid role: ${roleName}`);
        err.status = 400;
        err.code = 'INVALID_ROLE';
        throw err;
    }
 
    const targetRoles = await getUserRoles(targetUserId);
    const targetRoleNames = targetRoles.map(r => r.name);

    if (targetRoleNames.includes(roleName)) return { user_id: targetUserId, roles: targetRoleNames };

    await assignRole(targetUserId, roleName);
    const updated = await getUserRoles(targetUserId);
    return { user_id: targetUserId, roles: updated.map(r => r.name) };
}

async function removeUserRole(targetUserId, roleName) {
    const assignableRoles = Object.keys(ROLES).filter(r => r !== 'User');
    if (!assignableRoles.includes(roleName)) {
        const err = new Error(`Invalid role: ${roleName}`);
        err.status = 400;
        err.code = 'INVALID_ROLE';
        throw err;
    }
 
    const targetRoles = await getUserRoles(targetUserId);
    const targetRoleNames = targetRoles.map(r => r.name);

    if (!targetRoleNames.includes(roleName)) return { user_id: targetUserId, roles: targetRoleNames };

    if (roleName === 'Owner') {
        const roleMap = await getRoleMap();
        const owners = await getRoleUsers(roleMap['Owner']);
        if (owners.length <= 1) {
            const err = new Error('Cannot remove the last Owner');
            err.status = 409;
            err.code = 'LAST_OWNER';
            throw err;
        }
    }

    await removeRole(targetUserId, roleName);
    const updated = await getUserRoles(targetUserId);
    return { user_id: targetUserId, roles: updated.map(r => r.name) };
}

module.exports = { 
    getUsers,
    assignUserRole,
    removeUserRole
}