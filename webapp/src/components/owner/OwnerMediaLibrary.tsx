import { useEffect, useMemo, useState } from 'react';

type MediaFile = {
  id: string;
  kind: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  publicUrl: string;
  createdAt: string;
};

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0 KB';
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function OwnerMediaLibrary() {
  const [items, setItems] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const loadMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/owner/media', { credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || 'Не удалось загрузить медиатеку.');
      }
      setItems(Array.isArray(payload.items) ? payload.items : []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось загрузить медиатеку.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMedia();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, MediaFile[]>();
    for (const item of items) {
      const bucket = map.get(item.kind) || [];
      bucket.push(item);
      map.set(item.kind, bucket);
    }
    return [...map.entries()];
  }, [items]);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('URL скопирован в буфер обмена.');
    } catch {
      setStatus('Не удалось скопировать URL.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/owner/media/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || 'Не удалось удалить файл.');
      }
      setItems((current) => current.filter((item) => item.id !== id));
      setStatus('Файл удалён из медиатеки.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось удалить файл.');
    }
  };

  return (
    <section className="owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / медиа</span>
          <h2>Медиатека</h2>
          <p>Здесь видны все загруженные изображения из карточек, баннеров, подборок и категорий.</p>
        </div>
        <button className="button button--ghost" type="button" onClick={() => void loadMedia()}>
          Обновить список
        </button>
      </div>

      {status ? <div className="owner-editor-status owner-editor-status--spaced">{status}</div> : null}

      {loading ? <div className="owner-editor-card">Загружаю медиатеку...</div> : null}

      {!loading && items.length === 0 ? (
        <div className="owner-editor-card owner-analytics-empty">
          <h3>Пока нет файлов</h3>
          <p>Загрузи изображения в карточках, баннерах, подборках или категориях — они появятся здесь.</p>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="owner-cms-layout owner-cms-layout--stack">
          {grouped.map(([kind, files]) => (
            <section key={kind} className="owner-editor-card">
              <div className="owner-editor-list__head">
                <strong>{kind}</strong>
                <span>{files.length} файлов</span>
              </div>
              <div className="owner-media-grid">
                {files.map((item) => (
                  <article key={item.id} className="owner-media-card">
                    <img src={item.publicUrl} alt={item.fileName} className="owner-media-card__preview" />
                    <div className="owner-media-card__body">
                      <strong>{item.fileName}</strong>
                      <span>{formatBytes(item.sizeBytes)} · {new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                      <div className="owner-media-card__actions">
                        <button className="button button--ghost" type="button" onClick={() => void handleCopy(item.publicUrl)}>
                          Копировать URL
                        </button>
                        <button className="button button--ghost" type="button" onClick={() => void handleDelete(item.id)}>
                          Удалить
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </section>
  );
}
