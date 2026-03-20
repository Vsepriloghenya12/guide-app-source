const crypto = require('crypto');

const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'guide2026';
const TOKEN_SECRET = process.env.OWNER_TOKEN_SECRET || 'guide-owner-secret';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function toBase64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function signValue(value) {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(value).digest('base64url');
}

function createOwnerToken() {
  const payload = {
    role: 'owner',
    exp: Date.now() + TOKEN_TTL_MS
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifyOwnerToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return false;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signValue(encodedPayload);

  if (signature !== expectedSignature) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    return payload.role === 'owner' && typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

function getBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== 'string') {
    return '';
  }

  const [type, token] = headerValue.split(' ');
  return type === 'Bearer' ? token : '';
}

function requireOwnerAuth(req, res, next) {
  const token = getBearerToken(req.headers.authorization);

  if (!verifyOwnerToken(token)) {
    return res.status(401).json({ ok: false, message: 'Нужна авторизация владельца.' });
  }

  req.ownerToken = token;
  return next();
}

module.exports = {
  OWNER_PASSWORD,
  createOwnerToken,
  requireOwnerAuth,
  verifyOwnerToken
};
