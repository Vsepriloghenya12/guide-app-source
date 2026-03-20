import { FormEvent, useEffect, useMemo, useState } from 'react';
import { saveHomeContent } from '../../data/guideContent';
import type { HomeContent } from '../../types';

type OwnerHomeManagerProps = {
  home: HomeContent;
};

type HomeDraft = HomeContent;

const popularToneOptions = ['coast', 'bridge', 'sunset', 'night'] as const;
const categoryToneOptions = ['orange', 'blue', 'pink', 'green', 'red', 'teal', 'violet', 'gold'] as const;

function cloneHome(home: HomeContent): HomeDraft {
  return {
    popular: home.popular.map((item) => ({ ...item })),
    categories: home.categories.map((item) => ({ ...item })),
    tips: home.tips.map((item) => ({ ...item }))
  };
}

export function OwnerHomeManager({ home }: OwnerHomeManagerProps) {
  const [draft, setDraft] = useState<HomeDraft>(() => cloneHome(home));
  const [status, setStatus] = useState('');

  useEffect(() => {
    setDraft(cloneHome(home));
  }, [home]);

  const counts = useMemo(
    () => ({
      popular: draft.popular.length,
      categories: draft.categories.length,
      tips: draft.tips.length
    }),
    [draft]
  );

  const resetDraft = () => {
    setDraft(cloneHome(home));
    setStatus('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const prepared: HomeContent = {
      popular: draft.popular
        .map((item) => ({
          ...item,
          title: item.title.trim(),
          description: item.description.trim(),
          path: item.path.trim() || '/'
        }))
        .filter((item) => item.title),
      categories: draft.categories
        .map((item) => ({
          ...item,
          title: item.title.trim(),
          subtitle: item.subtitle.trim(),
          path: item.path.trim() || '/',
          badge: item.badge?.trim() || ''
        }))
        .filter((item) => item.title),
      tips: draft.tips
        .map((item) => ({
          ...item,
          title: item.title.trim(),
          path: item.path.trim() || '/'
        }))
        .filter((item) => item.title)
    };

    try {
      await saveHomeContent(prepared);
      setStatus('Главная страница сохранена.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось сохранить блоки главной страницы.');
    }
  };

  return (
    <section className="owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / главная</span>
          <h2>Управление главной страницей</h2>
          <p>
            Здесь редактируются блоки «Популярное», «Категории» и «Советы». Это уже отдельная mini-CMS
            для главного экрана, а не просто захардкоженные плитки.
          </p>
        </div>
        <button className="button button--ghost" type="button" onClick={resetDraft}>
          Вернуть текущие данные
        </button>
      </div>

      <form className="owner-editor-card owner-editor-form" onSubmit={handleSubmit}>
        <div className="owner-home-stats">
          <span className="owner-inline-note">Популярное: {counts.popular}</span>
          <span className="owner-inline-note">Категории: {counts.categories}</span>
          <span className="owner-inline-note">Советы: {counts.tips}</span>
        </div>

        <div className="owner-home-grid">
          <section className="owner-home-section-card">
            <div className="owner-home-section-card__header">
              <strong>Популярное</strong>
              <span>Карточки в первом блоке</span>
            </div>
            <div className="owner-home-item-list">
              {draft.popular.map((item, index) => (
                <div key={item.id} className="owner-home-item">
                  <label className="field">
                    <span>Заголовок</span>
                    <input
                      value={item.title}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          popular: current.popular.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, title: event.target.value } : entry
                          )
                        }))
                      }
                    />
                  </label>
                  <label className="field field--textarea">
                    <span>Описание</span>
                    <textarea
                      rows={3}
                      value={item.description}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          popular: current.popular.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, description: event.target.value } : entry
                          )
                        }))
                      }
                    />
                  </label>
                  <div className="owner-editor-form__grid owner-editor-form__grid--double">
                    <label className="field">
                      <span>Ссылка</span>
                      <input
                        value={item.path}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            popular: current.popular.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, path: event.target.value } : entry
                            )
                          }))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Тон карточки</span>
                      <select
                        value={item.tone || 'coast'}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            popular: current.popular.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, tone: event.target.value as HomeContent['popular'][number]['tone'] } : entry
                            )
                          }))
                        }
                      >
                        {popularToneOptions.map((tone) => (
                          <option key={tone} value={tone}>
                            {tone}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="owner-home-section-card">
            <div className="owner-home-section-card__header">
              <strong>Категории</strong>
              <span>Красивые плитки главной</span>
            </div>
            <div className="owner-home-item-list">
              {draft.categories.map((item, index) => (
                <div key={item.id} className="owner-home-item">
                  <div className="owner-editor-form__grid owner-editor-form__grid--double">
                    <label className="field">
                      <span>Название</span>
                      <input
                        value={item.title}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            categories: current.categories.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, title: event.target.value } : entry
                            )
                          }))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Badge</span>
                      <input
                        value={item.badge || ''}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            categories: current.categories.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, badge: event.target.value } : entry
                            )
                          }))
                        }
                      />
                    </label>
                  </div>
                  <label className="field">
                    <span>Подзаголовок</span>
                    <input
                      value={item.subtitle}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          categories: current.categories.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, subtitle: event.target.value } : entry
                          )
                        }))
                      }
                    />
                  </label>
                  <div className="owner-editor-form__grid owner-editor-form__grid--double">
                    <label className="field">
                      <span>Ссылка</span>
                      <input
                        value={item.path}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            categories: current.categories.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, path: event.target.value } : entry
                            )
                          }))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Тон плитки</span>
                      <select
                        value={item.tone || 'orange'}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            categories: current.categories.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, tone: event.target.value as HomeContent['categories'][number]['tone'] } : entry
                            )
                          }))
                        }
                      >
                        {categoryToneOptions.map((tone) => (
                          <option key={tone} value={tone}>
                            {tone}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="owner-home-section-card">
            <div className="owner-home-section-card__header">
              <strong>Советы</strong>
              <span>Контентный блок на главной</span>
            </div>
            <div className="owner-home-item-list">
              {draft.tips.map((item, index) => (
                <div key={item.id} className="owner-home-item">
                  <label className="field">
                    <span>Заголовок</span>
                    <input
                      value={item.title}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          tips: current.tips.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, title: event.target.value } : entry
                          )
                        }))
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Ссылка</span>
                    <input
                      value={item.path}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          tips: current.tips.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, path: event.target.value } : entry
                          )
                        }))
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>

        {status ? <div className="owner-editor-status">{status}</div> : null}

        <div className="owner-editor-form__actions">
          <button className="button button--primary" type="submit">
            Сохранить главную страницу
          </button>
          <button className="button button--ghost" type="button" onClick={resetDraft}>
            Отменить локальные изменения
          </button>
        </div>
      </form>
    </section>
  );
}
