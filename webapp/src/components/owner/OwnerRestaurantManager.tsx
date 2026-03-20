import { FormEvent, useMemo, useState } from 'react';
import { deleteRestaurant, saveRestaurant, uploadOwnerImage } from '../../lib/api';
import type { PublishStatus, RestaurantCuisine, RestaurantItem, RestaurantKind } from '../../types';

type OwnerRestaurantManagerProps = {
  items: RestaurantItem[];
  onUpdated: () => Promise<void> | void;
};

type RestaurantDraft = {
  id: string;
  title: string;
  kind: RestaurantKind;
  cuisine: RestaurantCuisine;
  breakfast: boolean;
  vegan: boolean;
  pets: boolean;
  avgCheck: string;
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

const initialDraft: RestaurantDraft = {
  id: '',
  title: '',
  kind: 'restaurant',
  cuisine: 'european',
  breakfast: false,
  vegan: false,
  pets: false,
  avgCheck: '',
  address: '',
  description: '',
  rating: '4.7',
  imageLabel: '',
  imageUrl: '',
  phone: '',
  website: '',
  hours: '',
  isFeatured: false,
  featuredRank: '0',
  status: 'published'
};

const kindLabelMap: Record<RestaurantKind, string> = {
  restaurant: 'Ресторан',
  club: 'Клуб',
  canteen: 'Столовая',
  coffee: 'Кофейня'
};

const cuisineLabelMap: Record<RestaurantCuisine, string> = {
  european: 'Европейская',
  caucasian: 'Кавказская',
  thai: 'Тайская',
  vietnamese: 'Вьетнамская'
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `restaurant-${crypto.randomUUID()}`;
  }

  return `restaurant-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toDraft(item: RestaurantItem): RestaurantDraft {
  return {
    id: item.id,
    title: item.title,
    kind: item.kind,
    cuisine: item.cuisine,
    breakfast: item.breakfast,
    vegan: item.vegan,
    pets: item.pets,
    avgCheck: String(item.avgCheck),
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

export function OwnerRestaurantManager({ items, onUpdated }: OwnerRestaurantManagerProps) {
  const [draft, setDraft] = useState<RestaurantDraft>(initialDraft);
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

  const handleImageChange = async (file?: File) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      setStatus('');
      const imageUrl = await uploadOwnerImage(file);
      setDraft((current) => ({
        ...current,
        imageUrl,
        imageLabel: current.imageLabel || 'Фото ресторана'
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

    const nextItem: RestaurantItem = {
      id: draft.id || createId(),
      title: draft.title.trim(),
      kind: draft.kind,
      cuisine: draft.cuisine,
      breakfast: draft.breakfast,
      vegan: draft.vegan,
      pets: draft.pets,
      avgCheck: Number(draft.avgCheck || 0),
      address: draft.address.trim(),
      description: draft.description.trim(),
      rating: Number(draft.rating || 0),
      imageLabel: draft.imageLabel.trim() || 'Фото ресторана',
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
      await saveRestaurant(nextItem);
      setStatus(draft.id ? 'Ресторан обновлён.' : 'Новый ресторан добавлен.');
      await onUpdated();
      resetForm();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось сохранить карточку ресторана.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item: RestaurantItem) => {
    setDraft(toDraft(item));
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить эту карточку ресторана?')) return;

    try {
      await deleteRestaurant(id);
      if (draft.id === id) {
        resetForm();
      }
      setStatus('Карточка ресторана удалена.');
      await onUpdated();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось удалить карточку ресторана.');
    }
  };

  return (
    <section className="owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / рестораны</span>
          <h2>Рестораны, кафе и столовые</h2>
          <p>
            Здесь владелец добавляет карточки, загружает фото, включает показ на главной и управляет
            статусом публикации.
          </p>
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
                placeholder="Например, Panorama Terrace"
              />
            </label>

            <label className="field">
              <span>Подпись на фото</span>
              <input
                value={draft.imageLabel}
                onChange={(event) => setDraft((current) => ({ ...current, imageLabel: event.target.value }))}
                placeholder="Например, Видовой ресторан"
              />
            </label>

            <label className="field">
              <span>Тип</span>
              <select
                value={draft.kind}
                onChange={(event) => setDraft((current) => ({ ...current, kind: event.target.value as RestaurantKind }))}
              >
                <option value="restaurant">Ресторан</option>
                <option value="club">Клуб</option>
                <option value="canteen">Столовая</option>
                <option value="coffee">Кофейня</option>
              </select>
            </label>

            <label className="field">
              <span>Кухня</span>
              <select
                value={draft.cuisine}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, cuisine: event.target.value as RestaurantCuisine }))
                }
              >
                <option value="european">Европейская</option>
                <option value="caucasian">Кавказская</option>
                <option value="thai">Тайская</option>
                <option value="vietnamese">Вьетнамская</option>
              </select>
            </label>

            <label className="field">
              <span>Средний чек</span>
              <input
                type="number"
                value={draft.avgCheck}
                onChange={(event) => setDraft((current) => ({ ...current, avgCheck: event.target.value }))}
                placeholder="650"
              />
            </label>

            <label className="field">
              <span>Рейтинг</span>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={draft.rating}
                onChange={(event) => setDraft((current) => ({ ...current, rating: event.target.value }))}
              />
            </label>
          </div>

          <label className="field">
            <span>Адрес</span>
            <input
              value={draft.address}
              onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))}
              placeholder="Набережная, 14"
            />
          </label>

          <label className="field field--textarea">
            <span>Описание</span>
            <textarea
              rows={5}
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder="Опиши атмосферу, кухню, особенности и кому подойдёт это место"
            />
          </label>

          <div className="owner-editor-form__grid owner-editor-form__grid--double">
            <label className="field">
              <span>Часы работы</span>
              <input
                value={draft.hours}
                onChange={(event) => setDraft((current) => ({ ...current, hours: event.target.value }))}
                placeholder="09:00–23:00"
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

            <label className="field field--wide">
              <span>Сайт / Instagram / ссылка</span>
              <input
                value={draft.website}
                onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))}
                placeholder="https://..."
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

          <div className="owner-checkbox-grid">
            <label className="checkbox-pill checkbox-pill--owner">
              <input
                type="checkbox"
                checked={draft.breakfast}
                onChange={(event) => setDraft((current) => ({ ...current, breakfast: event.target.checked }))}
              />
              <span>Есть завтраки</span>
            </label>
            <label className="checkbox-pill checkbox-pill--owner">
              <input
                type="checkbox"
                checked={draft.vegan}
                onChange={(event) => setDraft((current) => ({ ...current, vegan: event.target.checked }))}
              />
              <span>Веганское меню</span>
            </label>
            <label className="checkbox-pill checkbox-pill--owner">
              <input
                type="checkbox"
                checked={draft.pets}
                onChange={(event) => setDraft((current) => ({ ...current, pets: event.target.checked }))}
              />
              <span>Можно с животными</span>
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
                    <p>{kindLabelMap[item.kind]} · {cuisineLabelMap[item.cuisine]}</p>
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
