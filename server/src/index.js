const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const {
  initializeStore,
  getPublicContent,
  getOwnerContent,
  upsertRestaurant,
  upsertWellness,
  deleteListing,
  saveHomeTips,
  HAS_DATABASE
} = require('./dataStore');
const {
  OWNER_PASSWORD,
  createOwnerToken,
  requireOwnerAuth,
  verifyOwnerToken
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 8080;
const rootPath = path.resolve(__dirname, '../..');
const webDistPath = path.resolve(rootPath, 'webapp/dist');
const uploadsPath = path.resolve(rootPath, 'server/uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsPath),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('Можно загружать только изображения.'));
  }
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

function noStoreHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
}

function validateRestaurantPayload(payload) {
  if (!payload.title?.trim() || !payload.address?.trim() || !payload.description?.trim()) {
    return 'Заполни название, адрес и описание ресторана.';
  }

  return '';
}

function validateWellnessPayload(payload) {
  if (!payload.title?.trim() || !payload.address?.trim() || !payload.description?.trim()) {
    return 'Заполни название, адрес и описание СПА карточки.';
  }

  if (!Array.isArray(payload.services) || payload.services.length === 0) {
    return 'Выбери хотя бы одну услугу для СПА карточки.';
  }

  return '';
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'guide-app-server', storage: HAS_DATABASE ? 'postgres' : 'file' });
});

app.get('/api/public/bootstrap', async (_req, res) => {
  try {
    res.json({ ok: true, ...(await getPublicContent()) });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Не удалось загрузить публичный контент.' });
  }
});

app.post('/api/owner/login', (req, res) => {
  const password = String(req.body?.password || '');

  if (password !== OWNER_PASSWORD) {
    return res.status(401).json({ ok: false, message: 'Неверный пароль.' });
  }

  return res.json({ ok: true, token: createOwnerToken() });
});

app.get('/api/owner/session', (req, res) => {
  const header = req.headers.authorization || '';
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : '';
  res.json({ ok: true, authenticated: verifyOwnerToken(token) });
});

app.get('/api/owner/bootstrap', requireOwnerAuth, async (_req, res) => {
  try {
    res.json({ ok: true, ...(await getOwnerContent()) });
  } catch {
    res.status(500).json({ ok: false, message: 'Не удалось загрузить данные owner-CMS.' });
  }
});

app.post('/api/owner/upload', requireOwnerAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'Файл не получен.' });
  }

  return res.json({ ok: true, url: `/uploads/${req.file.filename}` });
});

app.post('/api/owner/restaurants', requireOwnerAuth, async (req, res) => {
  const errorMessage = validateRestaurantPayload(req.body);
  if (errorMessage) {
    return res.status(400).json({ ok: false, message: errorMessage });
  }

  try {
    const item = await upsertRestaurant({
      ...req.body,
      id: req.body.id || `restaurant-${crypto.randomUUID()}`
    });
    return res.json({ ok: true, item });
  } catch {
    return res.status(500).json({ ok: false, message: 'Не удалось сохранить ресторан.' });
  }
});

app.put('/api/owner/restaurants/:id', requireOwnerAuth, async (req, res) => {
  const errorMessage = validateRestaurantPayload(req.body);
  if (errorMessage) {
    return res.status(400).json({ ok: false, message: errorMessage });
  }

  try {
    const item = await upsertRestaurant({ ...req.body, id: req.params.id });
    return res.json({ ok: true, item });
  } catch {
    return res.status(500).json({ ok: false, message: 'Не удалось обновить ресторан.' });
  }
});

app.delete('/api/owner/restaurants/:id', requireOwnerAuth, async (req, res) => {
  try {
    await deleteListing('restaurants', req.params.id);
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, message: 'Не удалось удалить ресторан.' });
  }
});

app.post('/api/owner/wellness', requireOwnerAuth, async (req, res) => {
  const errorMessage = validateWellnessPayload(req.body);
  if (errorMessage) {
    return res.status(400).json({ ok: false, message: errorMessage });
  }

  try {
    const item = await upsertWellness({
      ...req.body,
      id: req.body.id || `wellness-${crypto.randomUUID()}`
    });
    return res.json({ ok: true, item });
  } catch {
    return res.status(500).json({ ok: false, message: 'Не удалось сохранить СПА карточку.' });
  }
});

app.put('/api/owner/wellness/:id', requireOwnerAuth, async (req, res) => {
  const errorMessage = validateWellnessPayload(req.body);
  if (errorMessage) {
    return res.status(400).json({ ok: false, message: errorMessage });
  }

  try {
    const item = await upsertWellness({ ...req.body, id: req.params.id });
    return res.json({ ok: true, item });
  } catch {
    return res.status(500).json({ ok: false, message: 'Не удалось обновить СПА карточку.' });
  }
});

app.delete('/api/owner/wellness/:id', requireOwnerAuth, async (req, res) => {
  try {
    await deleteListing('wellness', req.params.id);
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, message: 'Не удалось удалить СПА карточку.' });
  }
});

app.put('/api/owner/settings/home-tips', requireOwnerAuth, async (req, res) => {
  try {
    const settings = await saveHomeTips(req.body?.homeTips || []);
    return res.json({ ok: true, settings });
  } catch {
    return res.status(500).json({ ok: false, message: 'Не удалось сохранить советы на главной.' });
  }
});

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

app.use(
  express.static(webDistPath, {
    etag: true,
    setHeaders: (res, filePath) => {
      if (
        filePath.endsWith('index.html') ||
        filePath.endsWith('sw.js') ||
        filePath.endsWith('manifest.webmanifest')
      ) {
        noStoreHeaders(res);
        return;
      }

      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return;
      }

      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  })
);

app.get('*', (_req, res) => {
  noStoreHeaders(res);
  res.sendFile(path.join(webDistPath, 'index.html'));
});

async function start() {
  await fs.mkdir(uploadsPath, { recursive: true });
  await initializeStore();

  app.listen(PORT, () => {
    console.log(`Guide app server started on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start guide app server', error);
  process.exit(1);
});
