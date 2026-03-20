import { FormEvent, useMemo, useState } from 'react';
import { saveWellnessItems } from '../../data/guideContent';
import type { ListingStatus, WellnessItem } from '../../types';

type OwnerWellnessManagerProps = {
  items: WellnessItem[];
};

type WellnessDraft = {
  id?: string;
  title: string;
  services: WellnessItem['services'];
  childPrograms: boolean;
  address: string;
  description: string;
  rating: string;
  imageLabel: string;
  status: ListingStatus;
  sortOrder: string;
  featured: boolean;
  phone: string;
  website: string;
  hours: string;
  tags: string;
};

const serviceOptions: Array<{ value: WellnessItem['services'][number]; label: string }> = [
  { value: 'massage', label: 'Массаж' },
  { value: 'sauna', label: 'Баня' },
  { value: 'spa', label: 'СПА комплексы' },
  { value: 'hammam', label: 'Хамам' },
  { value: 'cosmetology', label: 'Косметология' },
  { value: 'wraps', label: 'Обертывания' },
  { value: 'yoga', label: 'Йога' }
];

const statusLabelMap: Record<ListingStatus, string> = {
  published: 'Опубликовано',
  hidden: 'Скрыто',
  draft: 'Черновик'
};

const initialDraft: WellnessDraft = {
  title: '',
  services: [],
  childPrograms: false,
  address: '',
  description: '',
  rating: '4.8',
  imageLabel: '',
  status: 'draft',
  sortOrder: '100',
  featured: false,
  phone: '',
  website: '',
  hours: '',
  tags: ''
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `wellness-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toDraft(item: WellnessItem): WellnessDraft {
  return {
    id: item.id,
    title: item.title,
    services: item.services,
    childPrograms: item.childPrograms,
    address: item.address,
    description: item.description,
    rating: String(item.rating),
    imageLabel: item.imageLabel,
    status: item.status,
    sortOrder: String(item.sortOrder),
    featured: item.featured,
    phone: item.phone,
    website: item.website,
    hours: item.hours,
    tags: item.tags.join(', ')
  };
}

function sortListings<T extends { featured: boolean; sortOrder: number; rating: number; title: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    if (left.rating !== right.rating) {
      return right.rating - left.rating;
    }
    return left.title.localeCompare(right.title, 'ru');
  });
}

function parseTags(tags: string) {
  return tags
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function OwnerWellnessManager({ items }: OwnerWellnessManagerProps) {
  const [draft, setDraft] = useState<WellnessDraft>(initialDraft);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');

  const sortedItems = useMemo(() => sortListings(items), [items]);

  const resetForm = () => {
    setDraft(initialDraft);
    setIsEditing(false);
  };

  const toggleService = (value: WellnessItem['services'][number], checked: boolean) => {
    setDraft((current) => ({
      ...current,
      services: checked
        ? [...current.services, value]
        : current.services.filter((item) => item !== value)
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextItem: WellnessItem = {
      id: draft.id || createId(),
      title: draft.title.trim(),
      services: draft.services,
      childPrograms: draft.childPrograms,
      address: draft.address.trim(),
      description: draft.description.trim(),
      rating: Number(draft.rating || 0),
      imageLabel: draft.imageLabel.trim() || 'Новая СПА карточка',
      status: draft.status,
      sortOrder: Number(draft.sortOrder || 0),
      featured: draft.featured,
      phone: draft.phone.trim(),
      website: draft.website.trim(),
      hours: draft.hours.trim(),
      tags: parseTags(draft.tags)
    };

    if (!nextItem.title || !nextItem.address || !nextItem.description || nextItem.services.length === 0) {
      setStatus('Заполни название, адрес, описание и выбери хотя бы одну услугу.');
      return;
    }

    const nextItems = draft.id
      ? items.map((item) => (item.id === draft.id ? nextItem : item))
      : [nextItem, ...items];

    try {
      await saveWellnessItems(nextItems);
      setStatus(draft.id ? 'СПА-карточка обновлена.' : 'Новая СПА-карточка добавлена.');
      resetForm();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось сохранить СПА-карточку.');
    }
  };

  const startEdit = (item: WellnessItem) => {
    setDraft(toDraft(item));
    setIsEditing(true);
    setStatus('');
  };

  const deleteItem = async (id: string) => {
    try {
      await saveWellnessItems(items.filter((item) => item.id !== id));
      if (draft.id === id) {
        resetForm();
      }
      setStatus('СПА-карточка удалена.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось удалить СПА-карточку.');
    }
  };

  return (
    <section className="owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / spa</span>
          <h2>Добавление и редактирование СПА и оздоровления</h2>
          <p>
            Для СПА-модуля теперь тоже доступны статусы, порядок показа, теги и главный переключатель
            «показывать в топе».
          </p>
        </div>
        <button className="button button--ghost" type="button" onClick={resetForm}>
          Новая карточка
        </button>
      </div>

      <div className="owner-cms-layout">
        <form className="owner-editor-card owner-editor-form" onSubmit={handleSubmit}>
          <div className="owner-editor-form__grid owner-editor-form__grid--triple">
            <label className="field">
              <span>Название</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Например, Ocean Balance Spa"
              />
            </label>

            <label className="field">
              <span>Подпись на фото</span>
              <input
                value={draft.imageLabel}
                onChange={(event) => setDraft((current) => ({ ...current, imageLabel: event.target.value }))}
                placeholder="Например, СПА-комплекс"
              />
            </label>

            <label className="field">
              <span>Статус</span>
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, status: event.target.value as ListingStatus }))
                }
              >
                <option value="published">Опубликовано</option>
                <option value="hidden">Скрыто</option>
                <option value="draft">Черновик</option>
              </select>
            </label>

            <label className="field">
              <span>Рейтинг</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={draft.rating}
                onChange={(event) => setDraft((current) => ({ ...current, rating: event.target.value }))}
              />
            </label>

            <label className="field">
              <span>Порядок</span>
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(event) => setDraft((current) => ({ ...current, sortOrder: event.target.value }))}
                placeholder="10"
              />
            </label>

            <label className="field">
              <span>Часы работы</span>
              <input
                value={draft.hours}
                onChange={(event) => setDraft((current) => ({ ...current, hours: event.target.value }))}
                placeholder="09:00–22:00"
              />
            </label>

            <label className="field">
              <span>Телефон</span>
              <input
                value={draft.phone}
                onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                placeholder="+84 ..."
              />
            </label>

            <label className="field">
              <span>Сайт</span>
              <input
                value={draft.website}
                onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))}
                placeholder="https://..."
              />
            </label>

            <label className="checkbox-pill checkbox-pill--owner checkbox-pill--owner-wide">
              <input
                type="checkbox"
                checked={draft.childPrograms}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, childPrograms: event.target.checked }))
                }
              />
              <span>Есть детские программы</span>
            </label>
          </div>

          <label className="field">
            <span>Адрес</span>
            <input
              value={draft.address}
              onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))}
              placeholder="Например, Морской проспект, 5"
            />
          </label>

          <label className="field field--textarea">
            <span>Описание</span>
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              rows={5}
              placeholder="Опиши форматы отдыха, атмосферу и ключевые услуги"
            />
          </label>

          <label className="field">
            <span>Теги через запятую</span>
            <input
              value={draft.tags}
              onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))}
              placeholder="ритуалы, релакс, премиум"
            />
          </label>

          <fieldset className="fieldset owner-services-fieldset">
            <legend>Услуги</legend>
            <div className="checkbox-list">
              {serviceOptions.map((service) => (
                <label key={service.value} className="checkbox-pill checkbox-pill--owner">
                  <input
                    type="checkbox"
                    checked={draft.services.includes(service.value)}
                    onChange={(event) => toggleService(service.value, event.target.checked)}
                  />
                  <span>{service.label}</span>
                </label>
              ))}
              <label className="checkbox-pill checkbox-pill--owner checkbox-pill--owner-highlight">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(event) => setDraft((current) => ({ ...current, featured: event.target.checked }))}
                />
                <span>Показывать в топе</span>
              </label>
            </div>
          </fieldset>

          {status ? <div className="owner-editor-status">{status}</div> : null}

          <div className="owner-editor-form__actions">
            <button className="button button--primary" type="submit">
              {isEditing ? 'Сохранить изменения' : 'Добавить карточку'}
            </button>
            <button className="button button--ghost" type="button" onClick={resetForm}>
              Очистить форму
            </button>
          </div>
        </form>

        <div className="owner-editor-card owner-editor-list">
          <div className="owner-editor-list__head">
            <strong>Карточки в разделе</strong>
            <span>{items.length} шт.</span>
          </div>

          <div className="owner-item-list">
            {sortedItems.map((item) => (
              <article key={item.id} className="owner-item-card">
                <div className="owner-item-card__top">
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      {item.services
                        .map((service) => serviceOptions.find((option) => option.value === service)?.label || service)
                        .join(' · ')}
                    </p>
                  </div>
                  <span className="owner-item-card__rating">★ {item.rating.toFixed(1)}</span>
                </div>

                <div className="owner-item-card__meta-row">
                  <span className={`owner-status-badge owner-status-badge--${item.status}`}>
                    {statusLabelMap[item.status]}
                  </span>
                  {item.featured ? <span className="owner-status-badge owner-status-badge--featured">Топ</span> : null}
                  <span className="owner-inline-note">Порядок: {item.sortOrder}</span>
                </div>

                <p className="owner-item-card__address">{item.address}</p>
                <p className="owner-item-card__description">{item.description}</p>

                {item.tags.length > 0 ? (
                  <div className="owner-tags-row">
                    {item.tags.map((tag) => (
                      <span key={tag} className="owner-tag">{tag}</span>
                    ))}
                  </div>
                ) : null}

                <div className="owner-item-card__subinfo">
                  <span>{item.hours || 'Часы не указаны'}</span>
                  <span>{item.phone || 'Телефон не указан'}</span>
                </div>

                <div className="owner-item-card__actions">
                  <button className="button button--ghost" type="button" onClick={() => startEdit(item)}>
                    Редактировать
                  </button>
                  <button className="button button--ghost" type="button" onClick={() => deleteItem(item.id)}>
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
