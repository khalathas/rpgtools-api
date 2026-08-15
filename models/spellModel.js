const { executeQuery } = require('../utils/dbUtils');

async function getSpells(pool, opts = {}) {

    // preload parameters from opts with page defaults
    const {
        page = 1, page_size = 50, name, school, subschool, components, cast_time, range, target, area, effect, duration, saving_throw, spell_resist
    } = opts;

    const where = [];
    const params = [];

    // build where clause subclauses based in which filters got defined in function params
    if (name) {
        where.push('s.name LIKE ?');
        params.push(`%${name}%`);
    }
    if (school) {
        where.push('s.school = ?');
        params.push(school);
    }
    if (subschool) {
        where.push('s.subschool = ?');
        params.push(subschool);
    }
    if (components) {
        where.push('s.components LIKE ?');
        params.push(`%${components}%`);
    }
    if (cast_time) {
        where.push('s.cast_time LIKE ?');
        params.push(`%${cast_time}%`);
    }
    if (range) {
        where.push('s.range LIKE ?');
        params.push(`%${range}%`);
    }
    if (target) {
        where.push('s.target LIKE ?');
        params.push(`%${target}%`);
    }
    if (area) {
        where.push('s.area LIKE ?');
        params.push(`%${area}%`);
    }
    if (effect) {
        where.push('s.effect LIKE ?');
        params.push(`%${effect}%`);
    }
    if (duration) {
        where.push('s.duration LIKE ?');
        params.push(`%${duration}%`);
    }
    if (saving_throw) {
        where.push('s.saving_throw LIKE ?');
        params.push(`%${saving_throw}%`);
    }
    if (spell_resist) {
        where.push('s.spell_resist LIKE ?');
        params.push(`%${spell_resist}%`);
    }

    // construct where clause based on which filters were defined
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // set up safe pagination with catches for invalid values, and calculate offset
    const safePage = Number.isInteger(+page) && +page > 0 ? +page : 1;
    const safePageSize = Math.min(Number.isInteger(+page_size) && +page_size > 0 ? +page_size : 50, 100);
    const offset = (safePage - 1) * safePageSize;

    // build complete sql statement with pagination
    const listSql = `SELECT id, name, school, subschool, descriptors, components, cast_time, \`range\`, target, area, effect, duration, saving_throw, spell_resist, mat_components, focus
    FROM spells s ${whereClause} ORDER BY s.name ASC LIMIT ? OFFSET ?`;

    // get total rows for pagination limits
    const countSql = `SELECT COUNT(*) as total FROM spells s ${whereClause}`;

    // execute both statments, store results in rows and countResult
    const [rows, countResult] = await Promise.all([
        executeQuery(pool, listSql, [...params, safePageSize, offset]),
        executeQuery(pool, countSql, params)
    ]);

    // return rows, total count, current page, and page size
    return { rows, total: countResult[0].total, page: safePage, page_size: safePageSize };
}

async function getSpellFacets(pool) {
    const fields = ['school', 'subschool', 'components', 'cast_time', '`range`', 'target', 'area', 'effect', 'duration', 'saving_throw', 'spell_resist'];
    const sql = fields.map(field => {const label = field.replace(/`/g, '');
            return `SELECT DISTINCT '${label}' AS facet, ${field} AS value FROM spells WHERE ${field} IS NOT NULL AND ${field} != ''`;
        }).join('\nUNION ALL\n') + '\nORDER BY facet, value ASC';

    const rows = await executeQuery(pool, sql);
    const facets = {};
    fields.forEach(field => {
        facets[field.replace(/`/g, '')] = [];
    });
    rows.forEach(row => {
        facets[row.facet].push(row.value);
    });
        
    return facets;
}

async function getSpellById(pool, id) {

    // build sql statement with variable placeholders
    const sql = 'SELECT * FROM spells s where s.id = ?';
    const params = [id];

    return executeQuery(pool,sql,params);
}   

async function getSpellsByField(pool, field, value) {

    // store parameters in variables
    const params = [field, ['%' + value + '%']];

    // build sql statement with variable placeholders
    const sql = 'SELECT * FROM spells s where ?? LIKE ?';

    return executeQuery(pool,sql,params);
}

async function getSpellsByClass(pool, className) { throw new Error('Not implemented'); }

async function getSpellsByClassAndLevel(pool, className, level) { throw new Error('Not implemented'); }

async function searchSpells(pool, filters) { throw new Error('Not implemented'); }

module.exports = {
    getSpells,
    getSpellFacets,
    getSpellById,
    getSpellsByField,
    getSpellsByClass,
    getSpellsByClassAndLevel,
    searchSpells
}   
