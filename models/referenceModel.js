// Catch all for data that doesn't have enough endpoints to warrant its own model/controller.

const { executeQuery } = require('../utils/dbUtils');

async function getSourceBooks(pool) {

    // build sql statement with variable placeholders
    const sql = 'SELECT * FROM source_books sb';
    const params = [];

    return executeQuery(pool,sql,params);
}

async function getSourceBookById(pool, id) {

    // build sql statement with variable placeholders
    const sql = 'SELECT * FROM source_books sb where sb.id = ?';
    const params = [id];

    return executeQuery(pool,sql,params);
}   


module.exports = {
    getSourceBooks,
    getSourceBookById
}