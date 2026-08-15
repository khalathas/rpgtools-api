const { executeQuery } = require('../utils/dbUtils');
const PATCHABLE = ['name', 'feat_type', 'prerequisites', 'benefit', 'normal', 'special', 'description'];
const PREREQ_PATCHABLE = ['prereq_type', 'prereq_value', 'prereq_min', 'prereq_key', 'prereq_feat_id', 'prereq_skill_id'];


async function getFeats(pool, opts = {}) {
    const { page = 1, page_size = 50, name, feat_type, source_book_id } = opts;
    const where = [];
    const params = [];
    if (name) {
        where.push('f.name LIKE ?');
        params.push(`%${name}%`);
    }
    if (feat_type) {
        where.push('f.feat_type = ?');
        params.push(feat_type);
    }
    if (source_book_id) {
        where.push('f.source_book_id = ?');
        params.push(source_book_id);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const safePage = Number.isInteger(+page) && +page > 0 ? +page : 1;
    const safePageSize = Math.min(Number.isInteger(+page_size) && +page_size > 0 ? +page_size : 50, 100);
    const offset = (safePage - 1) * safePageSize;

    const [rows, countResult] = await Promise.all([
        executeQuery(pool, `SELECT * FROM feats f ${whereClause} ORDER BY f.name ASC LIMIT ? OFFSET ?`, [...params, safePageSize, offset]),
        executeQuery(pool, `SELECT COUNT(*) as total FROM feats f ${whereClause}`, params)
    ]);

    return { rows, total: countResult[0].total, page: safePage, page_size: safePageSize };
}

async function getFeatFacets(pool) {
    const rows = await executeQuery(pool, `SELECT DISTINCT feat_type AS value FROM feats WHERE feat_type IS NOT NULL AND feat_type != '' ORDER BY feat_type ASC`);
    return { feat_type: rows.map(row => row.value) };
}

async function getFeatById(pool, id) {

    // build sql statement with variable placeholders
    const featSql = 'SELECT * FROM feats f where f.id = ?';
    const prereqSql = `SELECT id, prereq_type, prereq_value, prereq_min, prereq_key, prereq_feat_id, prereq_skill_id FROM feat_prerequisites WHERE feat_id = ? ORDER BY id ASC`;

    const [feats, prereqs] = await Promise.all([
        executeQuery(pool, featSql, [id]),
        executeQuery(pool, prereqSql, [id])
    ]);

    if (!feats.length) return [];
    return [{
        ...feats[0],
        prerequisites: prereqs
    }];
}   

async function getFeatsByType(pool, type) {
    const sql = 'SELECT * FROM feats f where f.feat_type = ?';
    const params = [type];
    return executeQuery(pool,sql,params);
}

async function createFeat(pool, data) {
    const sql = `INSERT INTO feats (source_book_id, name, feat_type, prerequisites, benefit, normal, special, description)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        data.source_book_id,
        data.name,
        data.feat_type    ?? null,
        data.prerequisites ?? null,
        data.benefit,
        data.normal       ?? null,
        data.special      ?? null,
        data.description  ?? null,
    ];
    return executeQuery(pool,sql,params);
}

async function getPrereqById(pool, prereqId) {
    const sql = 'SELECT * FROM feat_prerequisites WHERE id = ?';
    const params = [prereqId];
    return executeQuery(pool,sql,params);
}

async function updateFeat(pool, id, data) {
    const fields = Object.keys(data).filter(key => PATCHABLE.includes(key));
    if (!fields.length) return { affectedRows: 0 };
    const sql = `UPDATE feats SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
    const params = [...fields.map(f => data[f]), id];
    return executeQuery(pool,sql,params);
}

async function deleteFeat(pool, id) {
    const sql = 'DELETE FROM feats WHERE id = ?';
    const params = [id];
    return executeQuery(pool,sql,params);
}

async function createPrereq(pool, featId, data) {
    const sql = `INSERT INTO feat_prerequisites (feat_id, prereq_type, prereq_value, prereq_min, prereq_key, prereq_feat_id, prereq_skill_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        featId,
        data.prereq_type,
        data.prereq_value ?? null,
        data.prereq_min ?? null,
        data.prereq_key ?? null,
        data.prereq_feat_id ?? null,
        data.prereq_skill_id ?? null
    ];
    return executeQuery(pool,sql,params);
}

async function updatePrereqById(pool, featId, prereqId, data) {
    const fields = Object.keys(data).filter(key => PREREQ_PATCHABLE.includes(key));
    if (!fields.length) return { affectedRows: 0 };
    const sql = `UPDATE feat_prerequisites SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE feat_id = ? AND id = ?`;
    const params = [...fields.map(f => data[f]), featId, prereqId];
    return executeQuery(pool,sql,params);

}

async function deletePrereqById(pool, featId, prereqId) {
    const sql = 'DELETE FROM feat_prerequisites WHERE feat_id = ? AND id = ?';
    const params = [featId, prereqId];
    return executeQuery(pool,sql,params);
}

module.exports = { 
    getFeats,
    getFeatById,
    getFeatsByType,
    getFeatFacets,
    createFeat,
    updateFeat,
    deleteFeat,
    getPrereqById,
    createPrereq,
    updatePrereqById,
    deletePrereqById
}
