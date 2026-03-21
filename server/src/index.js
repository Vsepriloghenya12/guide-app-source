const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const webDistPath = path.resolve(__dirname, '../../webapp/dist');

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'guide-app-server' });
});

app.get('/api/owner/summary', (_req, res) => {
  res.json({
    sections: 14,
    listingsReady: 2,
    pwaEnabled: true
  });
});

app.use(express.static(webDistPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(webDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Guide app server started on port ${PORT}`);
});
