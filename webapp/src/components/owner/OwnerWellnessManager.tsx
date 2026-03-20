import { FormEvent, useMemo, useState } from 'react';
import { deleteWellness, saveWellness, uploadOwnerImage } from '../../lib/api';
import type { PublishStatus, WellnessItem, WellnessService } from '../../types';

type OwnerWellnessManagerProps = {
  items: WellnessItem[];
  onUpdated: () => Promise<void> | void;
};

type WellnessDraft = {
  id: string;
  title: string;
  services: WellnessService[];
  childPrograms: boolean;
  address: string;
  description: string;
  rating: string;
  imageLabel: string;
  imageUrl: string;
  phone: string;
  website: string;
  hours: string;
  isFeatured: boolean;
  featuredRank: string;
  status: PublishStatus;
};

const serviceOptions: Array<{ value: WellnessService; label: string }> = [
  { value: 'massage', label: 'Массажные салоны' },
  { value: 'sauna', label: 'Баня' },
  { value: 'spa', label: 'СПА комплексы' },
  { value: 'hammam', label: 'Хамам' },
  { value: 'cosmetology', label: 'Косметология' },
  { value: 'wraps', label: 'Обертывания' },
  { value: 'yoga', label: 'Йога' }
];

const initialDraft: WellnessDraft = {
  id: '',
  title: '',
  services: [],
  childPrograms: false,
  address: '',
  description: '',
  rating: '4.8',
  imageLabel: '',
  imageUrl: '',
  phone: '',
  website: '',
  hours: '',
  isFeatured: false,
  featuredRank: '0',
  status: 'published'
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `wellness-${crypto.randomUUID()}`;
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
    imageUrl: item.imageUrl,
    phone: item.phone,
    website: item.website,
    hours: item.hours,
    isFeatured: item.isFeatured,
    featuredRank: String(item.featuredRank),
    status: item.status
  };
}

export function OwnerWellnessManager({ items, onUpdated }: OwnerWellnessManagerProps) {
  const [draft, setDraft] = useState<WellnessDraft>(initialDraft);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const sortedItems = useMemo(
    () => [...items].sort((left, right) => right.rating - left.rating || right.featuredRank - left.featuredRank),
    [items]
  );

  const resetForm = () => {
    setDraft(initialDraft);
    setStatus('');
  };

  const toggleService = (value: WellnessService, checked: boolean) => {
    setDraft((current) => ({
      ...current,
      services: checked ? [...current.services, value] : current.services.filter((item) => item !== value)
    }));
  };

  const handleImageChange = async (file?: File) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      const imageUrl = await uploadOwnerImage(file);
      setDraft((current) => ({
        ...current,
        imageUrl,
        imageLabel: current.imageLabel || 'Фото СПА'
      }));
      setStatus('Фото загружено. Теперь можно сохранить карточку.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось загрузить изображение.');
    } finally {
      setUploadingImage(false);
    }
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
      imageLabel: draft.imageLabel.trim() || 'Фото СПА',
      imageUrl: draft.imageUrl.trim(),
      phone: draft.phone.trim(),
      website: draft.website.trim(),
      hours: draft.hours.trim(),
      isFeatured: draft.isFeatured,
      featuredRank: Number(draft.featuredRank || 0),
      status: draft.status
    };

    try {
      setSubmitting(true);
      setStatus('');
      await saveWellness(nextItem);
      setStatus(draft.id ? 'СПА карточка обновлена.' : 'Новая СПА карточка добавлена.');
      await onUpdated();
      resetForm();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось сохранить СПА карточку.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item: WellnessItem) => {
    setDraft(toDraft(item));
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить эту СПА карточку?')) return;

    try {
      await deleteWellness(id);
      if (draft.id === id) {
        resetForm();
      }
      setStatus('СПА карточка удалена.');
      await onUpdated();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось удалить СПА карточку.');
    }
  };

  return (
    <section className="owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / spa</span>
          <h2>СПА и оздоровление</h2>
          <p>Здесь владелец управляет карточками СПА, бань, хамама, йоги и других wellness-форматов.</p>
        </div>
        <button className="button button--ghost" type="button" onClick={resetForm}>
          Новая карточка
        </button>
      </div>

      <div className="owner-cms-layout">
        <form className="owner-editor-card owner-editor-form" onSubmit={handleSubmit}>
          <div className="owner-editor-form__grid owner-editor-form__grid--double">
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
          </div>

          <label className="field">
            <span>Адрес</span>
            <input
              value={draft.address}
              onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))}
              placeholder="Морской проспект, 5"
            />
          </label>

          <label className="field field--textarea">
            <span>Описание</span>
            <textarea
              rows={5}
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder="Опиши атмосферу, процедуры и для кого подходит это место"
            />
          </label>

          <div className="owner-editor-form__grid owner-editor-form__grid--double">
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
              <span>Статус</span>
              <select
                value={draft.status}
                onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as PublishStatus }))}
              >
                <option value="published">Опубликовано</option>
                <option value="draft">Черновик</option>
                <option value="hidden">Скрыто</option>
              </select>
            </label>

            <label className="field">
              <span>Часы работы</span>
              <input
                value={draft.hours}
                onChange={(event) => setDraft((current) => ({ ...current, hours: event.target.value }))}
                placeholder="10:00–22:00"
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
          </div>

          <label className="field">
            <span>Сайт / Instagram / ссылка</span>
            <input
              value={draft.website}
              onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))}
              placeholder="https://..."
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
            </div>
          </fieldset>

          <div className="owner-checkbox-grid">
            <label className="checkbox-pill checkbox-pill--owner">
              <input
                type="checkbox"
                checked={draft.childPrograms}
                onChange={(event) => setDraft((current) => ({ ...current, childPrograms: event.target.checked }))}
              />
              <span>Есть детские программы</span>
            </label>
            <label className="checkbox-pill checkbox-pill--owner">
              <input
                type="checkbox"
                checked={draft.isFeatured}
                onChange={(event) => setDraft((current) => ({ ...current, isFeatured: event.target.checked }))}
              />
              <span>Показывать в «Популярном»</span>
            </label>
          </div>

          <div className="owner-editor-form__grid owner-editor-form__grid--double">
            <label className="field">
              <span>Фото карточки</span>
              <input type="file" accept="image/*" onChange={(event) => handleImageChange(event.target.files?.[0])} />
              <small className="field__hint">{uploadingImage ? 'Загружаем фото...' : 'Фото загружается на сервер и сразу доступно в приложении.'}</small>
            </label>

            <label className="field">
              <span>Приоритет на главной</span>
              <input
                type="number"
                value={draft.featuredRank}
                onChange={(event) => setDraft((current) => ({ ...current, featuredRank: event.target.value }))}
                placeholder="0"
              />
            </label>
          </div>

          {draft.imageUrl ? (
            <div className="owner-image-preview">
              <img src={draft.imageUrl} alt={draft.imageLabel || draft.title || 'Превью'} />
            </div>
          ) : null}

          {status ? <div className="owner-editor-status">{status}</div> : null}

          <div className="owner-editor-form__actions">
            <button className="button button--primary" type="submit" disabled={submitting || uploadingImage}>
              {submitting ? 'Сохраняем...' : draft.id ? 'Сохранить изменения' : 'Добавить карточку'}
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

                {item.imageUrl ? (
                  <div className="owner-item-card__thumb">
                    <img src={item.imageUrl} alt={item.imageLabel || item.title} />
                  </div>
                ) : null}

                <p className="owner-item-card__address">{item.address}</p>
                <p className="owner-item-card__description">{item.description}</p>
                <div className="owner-item-card__chips">
                  <span className="place-card__tag">{item.status === 'published' ? 'Опубликовано' : item.status === 'draft' ? 'Черновик' : 'Скрыто'}</span>
                  {item.isFeatured ? <span className="place-card__tag">Популярное #{item.featuredRank}</span> : null}
                </div>

                <div className="owner-item-card__actions">
                  <button className="button button--ghost" type="button" onClick={() => startEdit(item)}>
                    Редактировать
                  </button>
                  <button className="button button--ghost" type="button" onClick={() => handleDelete(item.id)}>
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
