import { FormEvent, useState } from 'react';
import type { HomeTip } from '../../types';
import { saveHomeTips } from '../../lib/api';

type OwnerSettingsManagerProps = {
  items: HomeTip[];
  onUpdated: () => Promise<void> | void;
};

export function OwnerSettingsManager({ items, onUpdated }: OwnerSettingsManagerProps) {
  const [draft, setDraft] = useState<HomeTip[]>(() =>
    items.length > 0
      ? items
      : [
          { id: 'tip-1', title: 'Топ 10 мест Дананга', path: '/section/culture' },
          { id: 'tip-2', title: 'Где купить сувениры', path: '/section/shops' },
          { id: 'tip-3', title: 'Лучшие кафе города', path: '/restaurants' }
        ]
  );
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (index: number, key: keyof HomeTip, value: string) => {
    setDraft((current) =>
      current.map((tip, tipIndex) => (tipIndex === index ? { ...tip, [key]: value } : tip))
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setStatus('');
      await saveHomeTips(
        draft.map((tip, index) => ({
          id: tip.id || `tip-${index + 1}`,
          title: tip.title.trim(),
          path: tip.path.trim() || '/'
        }))
      );
      setStatus('Советы на главной сохранены.');
      await onUpdated();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось сохранить советы.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / главная</span>
          <h2>Блок «Советы»</h2>
          <p>Здесь редактируются ссылки и названия подсказок, которые показываются на главной странице.</p>
        </div>
      </div>

      <form className="owner-editor-card owner-editor-form" onSubmit={handleSubmit}>
        <div className="owner-tips-grid">
          {draft.map((tip, index) => (
            <div key={tip.id || index} className="owner-tip-card">
              <label className="field">
                <span>Название</span>
                <input
                  value={tip.title}
                  onChange={(event) => handleChange(index, 'title', event.target.value)}
                  placeholder="Например, Топ 10 мест Дананга"
                />
              </label>

              <label className="field">
                <span>Путь</span>
                <input
                  value={tip.path}
                  onChange={(event) => handleChange(index, 'path', event.target.value)}
                  placeholder="/section/culture"
                />
              </label>
            </div>
          ))}
        </div>

        {status ? <div className="owner-editor-status">{status}</div> : null}

        <div className="owner-editor-form__actions">
          <button className="button button--primary" type="submit" disabled={submitting}>
            {submitting ? 'Сохраняем...' : 'Сохранить советы'}
          </button>
        </div>
      </form>
    </section>
  );
}
