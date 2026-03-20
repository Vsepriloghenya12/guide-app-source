const express = require('express');
const path = require('path');
const { createGuideStore } = require('./store');

const app = express();
const PORT = process.env.PORT || 8080;
const webDistPath = path.resolve(__dirname, '../../webapp/dist');
const guideStore = createGuideStore();

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'guide-app-server' });
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

app.put('/api/content/restaurants', async (req, res) => {
  try {
    const restaurants = Array.isArray(req.body?.restaurants) ? req.body.restaurants : [];
    const content = await guideStore.replaceRestaurants(restaurants);
    res.json(content);
  } catch (error) {
    console.error('PUT /api/content/restaurants failed', error);
    res.status(500).json({ error: 'Не удалось сохранить рестораны.' });
  }
});

app.put('/api/content/wellness', async (req, res) => {
  try {
    const wellness = Array.isArray(req.body?.wellness) ? req.body.wellness : [];
    const content = await guideStore.replaceWellness(wellness);
    res.json(content);
  } catch (error) {
    console.error('PUT /api/content/wellness failed', error);
    res.status(500).json({ error: 'Не удалось сохранить СПА-раздел.' });
  }
});

app.post('/api/content/reset', async (_req, res) => {
  try {
    const content = await guideStore.resetContent();
    res.json(content);
  } catch (error) {
    console.error('POST /api/content/reset failed', error);
    res.status(500).json({ error: 'Не удалось сбросить данные.' });
  }
});

app.get('/api/owner/summary', async (_req, res) => {
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
