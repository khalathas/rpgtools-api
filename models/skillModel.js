const { executeQuery } = require('../utils/dbUtils');

async function getSkills(pool) {

    // build sql statement with variable placeholders
    const sql = 'SELECT * FROM skills s';
    const params = [];

    return executeQuery(pool,sql,params);
}

async function getSkillById(pool, id) {

    // build sql statement with variable placeholders
    const sql = 'SELECT * FROM skills s where s.id = ?';
    const params = [id];

    return executeQuery(pool,sql,params);
}   


module.exports = {
    getSkills,
    getSkillById
}