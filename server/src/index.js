const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { createGuideStore } = require('./store');

const app = express();
const PORT = process.env.PORT || 8080;
const webDistPath = path.resolve(__dirname, '../../webapp/dist');
const guideStore = createGuideStore();

const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'guide2026';
const OWNER_SESSION_COOKIE = 'guide_owner_session';
const OWNER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const ownerSessions = new Map();

app.use(express.json({ limit: '1mb' }));

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) {
        return acc;
      }

      const key = decodeURIComponent(part.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      acc[key] = value;
      return acc;
    }, {});
}

function isSecureRequest(req) {
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  if (typeof forwardedProto === 'string') {
    return forwardedProto.includes('https');
  }

  return req.secure;
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.secure) {
    parts.push('Secure');
  }

  parts.push(`Path=${options.path || '/'}`);
  return parts.join('; ');
}

function cleanupExpiredOwnerSessions() {
  const now = Date.now();
  for (const [token, session] of ownerSessions.entries()) {
    if (session.expiresAt <= now) {
      ownerSessions.delete(token);
    }
  }
}

function createOwnerSession() {
  const token = crypto.randomBytes(32).toString('hex');
  ownerSessions.set(token, { expiresAt: Date.now() + OWNER_SESSION_TTL_MS });
  return token;
}

function clearOwnerSession(token) {
  if (token) {
    ownerSessions.delete(token);
  }
}

function getOwnerSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies[OWNER_SESSION_COOKIE] || '';
}

function hasValidOwnerSession(req) {
  cleanupExpiredOwnerSessions();
  const token = getOwnerSessionToken(req);
  if (!token) {
    return false;
  }

  const session = ownerSessions.get(token);
  if (!session) {
    return false;
  }

  if (session.expiresAt <= Date.now()) {
    ownerSessions.delete(token);
    return false;
  }

  session.expiresAt = Date.now() + OWNER_SESSION_TTL_MS;
  ownerSessions.set(token, session);
  return true;
}

function setOwnerSessionCookie(req, res, token) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(OWNER_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: isSecureRequest(req),
      maxAge: OWNER_SESSION_TTL_MS / 1000,
      path: '/'
    })
  );
}

function clearOwnerSessionCookie(req, res) {
  const token = getOwnerSessionToken(req);
  clearOwnerSession(token);
  res.setHeader(
    'Set-Cookie',
    serializeCookie(OWNER_SESSION_COOKIE, '', {
      httpOnly: true,
      sameSite: 'Lax',
      secure: isSecureRequest(req),
      maxAge: 0,
      path: '/'
    })
  );
}

function requireOwnerSession(req, res, next) {
  if (!hasValidOwnerSession(req)) {
    clearOwnerSessionCookie(req, res);
    res.status(401).json({ error: 'Нужен вход в owner-CMS.' });
    return;
  }

  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'guide-app-server' });
});

app.post('/api/owner/login', (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';

  if (!password || password !== OWNER_PASSWORD) {
    res.status(401).json({ error: 'Неверный пароль владельца.' });
    return;
  }

  const token = createOwnerSession();
  setOwnerSessionCookie(req, res, token);
  res.json({ ok: true, authenticated: true });
});

app.post('/api/owner/logout', (req, res) => {
  clearOwnerSessionCookie(req, res);
  res.json({ ok: true, authenticated: false });
});

app.get('/api/owner/session', (req, res) => {
  const authenticated = hasValidOwnerSession(req);
  if (authenticated) {
    const token = getOwnerSessionToken(req);
    if (token) {
      setOwnerSessionCookie(req, res, token);
    }
  } else {
    clearOwnerSessionCookie(req, res);
  }

  res.json({ authenticated });
});

app.get('/api/content', async (_req, res) => {
  try {
    const content = await guideStore.getContent();
    res.json(content);
  } catch (error) {
    console.error('GET /api/content failed', error);
    res.status(500).json({ error: 'Не удалось загрузить контент приложения.' });
  }
});

app.put('/api/content/restaurants', requireOwnerSession, async (req, res) => {
  try {
    const restaurants = Array.isArray(req.body?.restaurants) ? req.body.restaurants : [];
    const content = await guideStore.replaceRestaurants(restaurants);
    res.json(content);
  } catch (error) {
    console.error('PUT /api/content/restaurants failed', error);
    res.status(500).json({ error: 'Не удалось сохранить рестораны.' });
  }
});

app.put('/api/content/wellness', requireOwnerSession, async (req, res) => {
  try {
    const wellness = Array.isArray(req.body?.wellness) ? req.body.wellness : [];
    const content = await guideStore.replaceWellness(wellness);
    res.json(content);
  } catch (error) {
    console.error('PUT /api/content/wellness failed', error);
    res.status(500).json({ error: 'Не удалось сохранить СПА-раздел.' });
  }
});

app.post('/api/content/reset', requireOwnerSession, async (_req, res) => {
  try {
    const content = await guideStore.resetContent();
    res.json(content);
  } catch (error) {
    console.error('POST /api/content/reset failed', error);
    res.status(500).json({ error: 'Не удалось сбросить данные.' });
  }
});

app.get('/api/owner/summary', requireOwnerSession, async (_req, res) => {
  try {
    const summary = await guideStore.getOwnerSummary();
    res.json(summary);
  } catch (error) {
    console.error('GET /api/owner/summary failed', error);
    res.status(500).json({ error: 'Не удалось получить summary для owner-раздела.' });
  }
});

app.use(express.static(webDistPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(webDistPath, 'index.html'));
});

guideStore
  .init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Guide app server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize GuideStore', error);
    process.exit(1);
  });
