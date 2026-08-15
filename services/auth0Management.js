const domain = process.env.AUTH0_MGMT_DOMAIN;
const clientId = process.env.AUTH0_MGMT_CLIENT_ID;
const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET;
const audience = process.env.AUTH0_MGMT_AUDIENCE;

let cachedToken = null;
let tokenExpiry = 0;
let cachedRoleMap = null;
let roleMapExpiry = 0;
const ROLE_MAP_TTL_MS = 10 * 60 * 1000;


// Token management
async function getManagementToken() {
    if (cachedToken && Date.now() < tokenExpiry - 60000) return cachedToken;

    const res = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type:    'client_credentials',
      client_id:     clientId,
      client_secret: clientSecret,
      audience,
    }),
  });

  if (!res.ok) {
    throw await buildAuth0Error(res, 'Auth0 token fetch failed');
  }

  const data = await res.json();
  cachedToken  = data.access_token;
  tokenExpiry  = Date.now() + data.expires_in * 1000;
  return cachedToken;

}

// Internal helper functions
async function auth0Fetch(path, options = {}) {
  const token = await getManagementToken();
  const res = await fetch(`https://${domain}/api/v2${path}`, {
    ...options,
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) throw await buildAuth0Error(res, `Auth0 API error on ${path}`);

  // DELETE /roles returns 204 no body
  if (res.status === 204) return null;
  return res.json();
}

function clampInt(value, fallback, min, max) {
  if (value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

async function buildAuth0Error(res, context) {
  let rawBody = '';

  try {
    rawBody = await res.text();
  } catch {
    rawBody = '';
  }

  let errorBody = rawBody;

  try {
    errorBody = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    errorBody = rawBody || null;
  }

  const message =
    errorBody && typeof errorBody === 'object'
      ? errorBody.message || errorBody.error_description || errorBody.error
      : errorBody;

  const err = new Error(
    `${context}: ${res.status}${message ? ` - ${message}` : ''}`
  );

  err.status = res.status;
  err.auth0 = {
    status: res.status,
    error: errorBody && typeof errorBody === 'object' ? errorBody.error : undefined,
    message: message || undefined,
  };

  return err;
}

// Role map (name -> id)

async function getRoleMap() {
  if (cachedRoleMap && Date.now() < roleMapExpiry) return cachedRoleMap;

  const roles = await auth0Fetch('/roles');
  cachedRoleMap = Object.fromEntries(roles.map(r => [r.name, r.id]));
  roleMapExpiry = Date.now() + ROLE_MAP_TTL_MS;

  return cachedRoleMap;
}

// Public API

async function listUsers(page = 1, perPage = 50, query = '') {
  const safePage = clampInt(page, 1, 1, 1000);
  const safePerPage = clampInt(perPage, 50, 1, 100);

  const params = new URLSearchParams({
    page: safePage - 1, // Auth0 is 0-indexed
    per_page: safePerPage,
    include_totals: true,
  });

  if (query) params.set('q', query);
  return auth0Fetch(`/users?${params}`);
}

async function getUserRoles(userId) {
  return auth0Fetch(`/users/${encodeURIComponent(userId)}/roles`);
}

async function assignRole(userId, roleName) {
  const roleMap = await getRoleMap();
  const roleId = roleMap[roleName];

  if (!roleId) {
    const err = new Error(`Unknown role: ${roleName}`);
    err.status = 400;
    throw err;
  }

  return auth0Fetch(`/users/${encodeURIComponent(userId)}/roles`, {
    method: 'POST',
    body: JSON.stringify({ roles: [roleId] }),
  });
}

async function removeRole(userId, roleName) {
  const roleMap = await getRoleMap();
  const roleId = roleMap[roleName];

  if (!roleId) {
    const err = new Error(`Unknown role: ${roleName}`);
    err.status = 400;
    throw err;
  }

  return auth0Fetch(`/users/${encodeURIComponent(userId)}/roles`, {
    method: 'DELETE',
    body: JSON.stringify({ roles: [roleId] }),
  });
}

async function getRoleUsers(roleId) {
  return auth0Fetch(`/roles/${encodeURIComponent(roleId)}/users`);
}

module.exports = { 
    getRoleMap, 
    listUsers, 
    getUserRoles, 
    assignRole, 
    removeRole, 
    getRoleUsers
};