import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'ids-iot-secret-signature-key-2026-v2';

// In-memory user store
const usersStore = new Map();

// Helper: base64url encode/decode
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

// Password hashing using PBKDF2
export function hashPassword(password, salt = null) {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash: `${generatedSalt}:${hash}`, salt: generatedSalt };
}

export function verifyPassword(password, storedCombined) {
  if (!storedCombined || !storedCombined.includes(':')) return false;
  const [salt, originalHash] = storedCombined.split(':');
  const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return checkHash === originalHash;
}

// JWT Implementation (Standard HMAC-SHA256 JWT)
export function generateToken(payload, expiresInSeconds = 24 * 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

// Pre-seed default users
function seedDefaultUsers() {
  const defaultAdmin = hashPassword('admin123');
  usersStore.set('admin', {
    id: 'USR-001',
    username: 'admin',
    name: 'Chief Security Officer',
    role: 'admin',
    passwordHash: defaultAdmin.hash,
    createdAt: new Date().toISOString()
  });

  const defaultAnalyst = hashPassword('analyst123');
  usersStore.set('analyst', {
    id: 'USR-002',
    username: 'analyst',
    name: 'Edge AI Threat Analyst',
    role: 'operator',
    passwordHash: defaultAnalyst.hash,
    createdAt: new Date().toISOString()
  });
}

seedDefaultUsers();

// User management functions
export function getUser(username) {
  return usersStore.get(username.toLowerCase());
}

export function registerUser(username, password, name = '', role = 'operator') {
  const normalized = username.trim().toLowerCase();
  if (usersStore.has(normalized)) {
    throw new Error('Username already exists');
  }

  const { hash } = hashPassword(password);
  const newUser = {
    id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    username: normalized,
    name: name.trim() || normalized,
    role,
    passwordHash: hash,
    createdAt: new Date().toISOString()
  };

  usersStore.set(normalized, newUser);
  return { id: newUser.id, username: newUser.username, name: newUser.name, role: newUser.role };
}

export function authenticateUser(username, password) {
  const user = getUser(username);
  if (!user) return null;

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role
  };
}

export function listUsers() {
  return Array.from(usersStore.values()).map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt
  }));
}

// Express Middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}
