import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { updateGuideContent } from '../../data/guideContent';
import type { GuideCategory, GuideCategoryId, GuidePlace } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { uploadImageAsset } from '../../utils/imageUpload';
import { createGoogleMapsUrl } from '../../utils/places';

type OwnerPlacesManagerProps = {
  items: GuidePlace[];
  categories: GuideCategory[];
};

type PlaceDraft = {
  id?: string;
  categoryId: GuidePlace['categoryId'];
  title: string;
  slug: string;
  description: string;
  address: string;
  district: string;
  mapQuery: string;
  phone: string;
  website: string;
  hours: string;
  avgCheck: string;
  hotelStars: string;
  kind: string;
  cuisine: string;
  services: string;
  tags: string;
  breakfast: boolean;
  vegan: boolean;
  pets: boolean;
  hotelPool: boolean;
  hotelSpa: boolean;
  childPrograms: boolean;
  top: boolean;
  status: NonNullable<GuidePlace['status']>;
  sortOrder: string;
  rating: string;
  lat: string;
  lng: string;
  imageLabel: string;
  imageSrc: string;
  imageGallery: string[];
};

const initialDraft: PlaceDraft = {
  categoryId: 'restaurants',
  title: '',
  slug: '',
  description: '',
  address: '',
  district: '',
  mapQuery: '',
  phone: '',
  website: '',
  hours: '',
  avgCheck: '',
  hotelStars: '',
  kind: '',
  cuisine: '',
  services: '',
  tags: '',
  breakfast: false,
  vegan: false,
  pets: false,
  hotelPool: false,
  hotelSpa: false,
  childPrograms: false,
  top: false,
  status: 'published',
  sortOrder: '100',
  rating: '4.7',
  lat: '',
  lng: '',
  imageLabel: '',
  imageSrc: '',
  imageGallery: []
};

const statusMeta: Record<NonNullable<GuidePlace['status']>, { label: string; className: string; helper: string }> = {
  published: {
    label: 'Опубликовано',
    className: 'is-published',
    helper: 'Карточка видна в публичной части приложения.'
  },
  hidden: {
    label: 'Скрыто',
    className: 'is-hidden',
    helper: 'Карточка сохранена, но не показывается пользователям.'
  },
  draft: {
    label: 'Черновик',
    className: 'is-draft',
    helper: 'Карточка редактируется и не публикуется наружу.'
  }
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `place-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseMultiValue(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseNullableNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function toEditableGoogleMapsLink(item: Pick<GuidePlace, 'mapQuery' | 'address' | 'title'>) {
  if (item.mapQuery?.trim()) {
    return createGoogleMapsUrl({
      mapQuery: item.mapQuery,
      address: item.address,
      title: item.title
    });
  }

  if (item.address.trim() || item.title.trim()) {
    return createGoogleMapsUrl({
      mapQuery: '',
      address: item.address,
      title: item.title
    });
  }

  return '';
}

function getPlaceImages(item: GuidePlace) {
  if (Array.isArray(item.imageGallery) && item.imageGallery.length > 0) {
    return item.imageGallery;
  }
  return item.imageSrc ? [item.imageSrc] : [];
}

function toDraft(item: GuidePlace): PlaceDraft {
  const imageGallery = getPlaceImages(item);

  return {
    id: item.id,
    categoryId: item.categoryId,
    title: item.title,
    slug: item.slug || '',
    description: item.description,
    address: item.address,
    district: item.district || '',
    mapQuery: toEditableGoogleMapsLink(item),
    phone: item.phone,
    website: item.website,
    hours: item.hours,
    avgCheck: item.avgCheck ? String(item.avgCheck) : '',
    hotelStars: typeof item.hotelStars === 'number' ? String(item.hotelStars) : '',
    kind: item.kind,
    cuisine: item.cuisine,
    services: item.services.join(', '),
    tags: item.tags.join(', '),
    breakfast: item.breakfast,
    vegan: item.vegan,
    pets: item.pets,
    hotelPool: Boolean(item.hotelPool),
    hotelSpa: Boolean(item.hotelSpa),
    childPrograms: item.childPrograms,
    top: item.top,
    status: item.status || 'published',
    sortOrder: String(item.sortOrder ?? 100),
    rating: String(item.rating),
    lat: typeof item.lat === 'number' ? String(item.lat) : '',
    lng: typeof item.lng === 'number' ? String(item.lng) : '',
    imageLabel: item.imageLabel,
    imageSrc: imageGallery[0] ?? '',
    imageGallery
  };
}

function sortPlaces(left: GuidePlace, right: GuidePlace) {
  const leftOrder = Number(left.sortOrder ?? 1000);
  const rightOrder = Number(right.sortOrder ?? 1000);
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  if (left.top !== right.top) {
    return Number(right.top) - Number(left.top);
  }
  if (left.rating !== right.rating) {
    return right.rating - left.rating;
  }
  return left.title.localeCompare(right.title);
}

export function OwnerPlacesManager({ items, categories }: OwnerPlacesManagerProps) {
  const [draft, setDraft] = useState<PlaceDraft>(initialDraft);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState<GuideCategoryId>('restaurants');
  const [isUploading, setIsUploading] = useState(false);

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.visible || items.some((item) => item.categoryId === category.id)),
    [categories, items]
  );

  const activeCategory = categories.find((category) => category.id === activeTab);

  const visibleItems = useMemo(() => {
    return [...items].filter((item) => item.categoryId === activeTab).sort(sortPlaces);
  }, [activeTab, items]);

  const draftStatusMeta = statusMeta[draft.status];

  const resetForm = () => {
    setDraft({
      ...initialDraft,
      categoryId: activeTab,
      sortOrder: String(Math.max(visibleItems.length * 10 + 10, 10))
    });
    setIsEditing(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedGallery = draft.imageGallery.filter(Boolean);
    const generatedSlug = normalizeSlug(draft.slug || draft.title || `${draft.categoryId}-${draft.id || createId()}`);
    const nextItem: GuidePlace = {
      id: draft.id || createId(),
      categoryId: draft.categoryId,
      title: draft.title.trim(),
      slug: generatedSlug,
      description: draft.description.trim(),
      address: draft.address.trim(),
      district: draft.district.trim(),
      mapQuery: draft.mapQuery.trim() || draft.address.trim(),
      phone: draft.phone.trim(),
      website: draft.website.trim(),
      hours: draft.hours.trim(),
      avgCheck: draft.avgCheck ? Number(draft.avgCheck) : undefined,
      hotelStars: draft.categoryId === 'hotels' && draft.hotelStars ? Number(draft.hotelStars) : null,
      hotelPool: draft.categoryId === 'hotels' ? draft.hotelPool : false,
      hotelSpa: draft.categoryId === 'hotels' ? draft.hotelSpa : false,
      kind: draft.kind.trim(),
      cuisine: draft.cuisine.trim(),
      services: parseMultiValue(draft.services),
      tags: parseMultiValue(draft.tags),
      breakfast: draft.breakfast,
      vegan: draft.vegan,
      pets: draft.pets,
      childPrograms: draft.childPrograms,
      top: draft.top,
      status: draft.status,
      sortOrder: Number(draft.sortOrder || 100) || 100,
      rating: Number(draft.rating || 0),
      lat: parseNullableNumber(draft.lat),
      lng: parseNullableNumber(draft.lng),
      imageLabel: draft.imageLabel.trim() || 'Карточка места',
      imageSrc: normalizedGallery[0] ?? '',
      imageGallery: normalizedGallery
    };

    if (!nextItem.title || !nextItem.address || !nextItem.description) {
      setStatus('Заполни название, адрес и описание карточки.');
      return;
    }

    if (!nextItem.slug) {
      setStatus('Не удалось подготовить адрес карточки. Проверь название места.');
      return;
    }

    updateGuideContent((current) => ({
      ...current,
      places: draft.id
        ? current.places.map((item) => (item.id === draft.id ? nextItem : item))
        : [...current.places, nextItem]
    }));

    setActiveTab(nextItem.categoryId);
    setStatus(draft.id ? 'Карточка обновлена.' : 'Новая карточка добавлена.');
    setDraft({
      ...initialDraft,
      categoryId: nextItem.categoryId,
      sortOrder: String(Math.max((visibleItems.length + (draft.id ? 0 : 1)) * 10 + 10, 10))
    });
    setIsEditing(false);
  };

  const startEdit = (item: GuidePlace) => {
    setDraft(toDraft(item));
    setActiveTab(item.categoryId);
    setIsEditing(true);
    setStatus('');
  };

  const deleteItem = (id: string) => {
    updateGuideContent((current) => ({
      ...current,
      places: current.places.filter((item) => item.id !== id),
      home: {
        ...current.home,
        popularPlaceIds: current.home.popularPlaceIds.filter((itemId) => itemId !== id)
      },
      collections: current.collections.map((collection) => ({
        ...collection,
        itemIds: collection.itemIds.filter((itemId) => itemId !== id)
      }))
    }));

    if (draft.id === id) {
      setDraft({ ...initialDraft, categoryId: activeTab, sortOrder: String(Math.max((visibleItems.length - 1) * 10 + 10, 10)) });
      setIsEditing(false);
    }

    setStatus('Карточка удалена.');
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setStatus(`Загружаю ${files.length} фото...`);

    try {
      const uploadedImages = await Promise.all(files.map((file) => uploadImageAsset(file, 'place')));
      setDraft((current) => ({
        ...current,
        imageGallery: [...current.imageGallery, ...uploadedImages],
        imageSrc: current.imageSrc || uploadedImages[0] || '',
        imageLabel: current.imageLabel || files[0]?.name || current.imageLabel
      }));
      setStatus(`Загружено: ${uploadedImages.length} фото.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось загрузить изображения.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const removeImage = (imageIndex: number) => {
    setDraft((current) => {
      const nextGallery = current.imageGallery.filter((_, index) => index !== imageIndex);
      return {
        ...current,
        imageGallery: nextGallery,
        imageSrc: nextGallery[0] ?? ''
      };
    });
  };

  const makeCover = (imageIndex: number) => {
    setDraft((current) => {
      const nextGallery = [...current.imageGallery];
      const [selectedImage] = nextGallery.splice(imageIndex, 1);
      if (!selectedImage) {
        return current;
      }
      nextGallery.unshift(selectedImage);
      return {
        ...current,
        imageGallery: nextGallery,
        imageSrc: nextGallery[0] ?? ''
      };
    });
  };

  return (
    <section className="owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / карточки</span>
          <h2>Карточки мест по категориям</h2>
          <p>
            Владелец теперь управляет не только текстами и фото, но и статусом карточки, порядком
            показа и ссылкой на Google Maps для каждой карточки.
          </p>
        </div>
        <button className="button button--ghost" type="button" onClick={resetForm} disabled={isUploading}>
          Новая карточка
        </button>
      </div>

      <div className="owner-inline-tabs owner-inline-tabs--categories">
        {visibleCategories.map((category) => {
          const count = items.filter((item) => item.categoryId === category.id).length;
          return (
            <button
              key={category.id}
              type="button"
              className={`button button--ghost owner-tab-button ${activeTab === category.id ? 'is-active' : ''}`}
              onClick={() => {
                setActiveTab(category.id);
                if (!isEditing) {
                  setDraft((current) => ({ ...current, categoryId: category.id }));
                }
              }}
            >
              <CategoryIcon categoryId={category.id} size="sm" />
              <span className="owner-tab-button__text">{category.title}</span>
              <span className="owner-tab-button__count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="owner-cms-layout">
        <form className="owner-editor-card owner-editor-form" onSubmit={handleSubmit}>
          <div className="owner-editor-form__grid owner-editor-form__grid--double">
            <label className="field">
              <span>Категория</span>
              <select
                value={draft.categoryId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    categoryId: event.target.value as GuidePlace['categoryId']
                  }))
                }
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Название</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Например, Panorama Terrace"
              />
            </label>

            <label className="field">
              <span>Статус публикации</span>
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, status: event.target.value as NonNullable<GuidePlace['status']> }))
                }
              >
                <option value="published">Опубликовано</option>
                <option value="hidden">Скрыто</option>
                <option value="draft">Черновик</option>
              </select>
            </label>

            <label className="field">
              <span>Тип</span>
              <input
                value={draft.kind}
                onChange={(event) => setDraft((current) => ({ ...current, kind: event.target.value }))}
                placeholder="Например, Ресторан / Кофейня / Хамам"
              />
            </label>

            <label className="field">
              <span>Кухня / направление</span>
              <input
                value={draft.cuisine}
                onChange={(event) => setDraft((current) => ({ ...current, cuisine: event.target.value }))}
                placeholder="Например, Европейская"
              />
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

            {draft.categoryId === 'hotels' ? (
              <label className="field">
                <span>Звёзды</span>
                <select value={draft.hotelStars} onChange={(event) => setDraft((current) => ({ ...current, hotelStars: event.target.value }))}>
                  <option value="">Не указано</option>
                  <option value="5">5★</option>
                  <option value="4">4★</option>
                  <option value="3">3★</option>
                  <option value="2">2★</option>
                  <option value="1">1★</option>
                </select>
              </label>
            ) : null}

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
              <span>Порядок показа</span>
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(event) => setDraft((current) => ({ ...current, sortOrder: event.target.value }))}
                placeholder="10"
              />
            </label>

            <div className={`owner-status-hint ${draftStatusMeta.className}`}>
              <strong>{draftStatusMeta.label}</strong>
              <span>{draftStatusMeta.helper}</span>
            </div>
          </div>

          <label className="field">
            <span>Адрес</span>
            <input
              value={draft.address}
              onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))}
              placeholder="Например, Набережная, 14"
            />
          </label>

          <div className="owner-editor-form__grid owner-editor-form__grid--double">
            <label className="field">
              <span>Ссылка Google Maps</span>
              <input
                value={draft.mapQuery}
                onChange={(event) => setDraft((current) => ({ ...current, mapQuery: event.target.value }))}
                placeholder="Вставь ссылку на точку из Google Maps"
              />
            </label>
          </div>

          <div className="owner-editor-form__grid owner-editor-form__grid--double owner-editor-form__grid--triple">
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

            <label className="field">
              <span>Часы работы</span>
              <input
                value={draft.hours}
                onChange={(event) => setDraft((current) => ({ ...current, hours: event.target.value }))}
                placeholder="08:00–23:00"
              />
            </label>

            <label className="field">
              <span>Подпись на фото</span>
              <input
                value={draft.imageLabel}
                onChange={(event) => setDraft((current) => ({ ...current, imageLabel: event.target.value }))}
                placeholder="Короткая подпись"
              />
            </label>
          </div>

          <label className="field field--textarea">
            <span>Описание</span>
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              rows={5}
              placeholder="Опиши место, атмосферу и ключевые особенности"
            />
          </label>

          <div className="owner-editor-form__grid owner-editor-form__grid--double">
            <label className="field">
              <span>Услуги / особенности</span>
              <input
                value={draft.services}
                onChange={(event) => setDraft((current) => ({ ...current, services: event.target.value }))}
                placeholder="Через запятую: Завтраки, Терраса, Массаж"
              />
            </label>

            <label className="field">
              <span>Теги и фильтры</span>
              <input
                value={draft.tags}
                onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))}
                placeholder="Через запятую: романтика, вид, бюджетно"
              />
            </label>
          </div>

          <label className="field field--file">
            <span>{isUploading ? 'Загрузка фото...' : 'Фото карточки'}</span>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} disabled={isUploading} />
          </label>

          {draft.imageGallery.length > 0 ? (
            <div className="owner-gallery-preview-grid">
              {draft.imageGallery.map((image, index) => (
                <article key={`${image}-${index}`} className="owner-gallery-preview-card">
                  <img src={image} alt={`${draft.title || 'Фото'} ${index + 1}`} loading="lazy" decoding="async" />
                  <div className="owner-gallery-preview-card__actions">
                    {index === 0 ? (
                      <span className="owner-gallery-preview-card__cover">Обложка</span>
                    ) : (
                      <button className="button button--ghost" type="button" onClick={() => makeCover(index)}>
                        Сделать обложкой
                      </button>
                    )}
                    <button className="button button--ghost" type="button" onClick={() => removeImage(index)}>
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
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
              <span>Веган-опции</span>
            </label>
            <label className="checkbox-pill checkbox-pill--owner">
              <input
                type="checkbox"
                checked={draft.pets}
                onChange={(event) => setDraft((current) => ({ ...current, pets: event.target.checked }))}
              />
              <span>Можно с животными</span>
            </label>
            {draft.categoryId === 'hotels' ? (
              <label className="checkbox-pill checkbox-pill--owner">
                <input
                  type="checkbox"
                  checked={draft.hotelPool}
                  onChange={(event) => setDraft((current) => ({ ...current, hotelPool: event.target.checked }))}
                />
                <span>Есть бассейн</span>
              </label>
            ) : null}
            {draft.categoryId === 'hotels' ? (
              <label className="checkbox-pill checkbox-pill--owner">
                <input
                  type="checkbox"
                  checked={draft.hotelSpa}
                  onChange={(event) => setDraft((current) => ({ ...current, hotelSpa: event.target.checked }))}
                />
                <span>Есть СПА</span>
              </label>
            ) : null}
            <label className="checkbox-pill checkbox-pill--owner checkbox-pill--owner-wide">
              <input
                type="checkbox"
                checked={draft.childPrograms}
                onChange={(event) => setDraft((current) => ({ ...current, childPrograms: event.target.checked }))}
              />
              <span>Есть детские программы</span>
            </label>
            <label className="checkbox-pill checkbox-pill--owner checkbox-pill--owner-accent">
              <input
                type="checkbox"
                checked={draft.top}
                onChange={(event) => setDraft((current) => ({ ...current, top: event.target.checked }))}
              />
              <span>Показывать в топе</span>
            </label>
          </div>

          {status ? <div className="owner-editor-status">{status}</div> : null}

          <div className="owner-editor-form__actions">
            <button className="button button--primary" type="submit" disabled={isUploading}>
              {isEditing ? 'Сохранить изменения' : 'Добавить карточку'}
            </button>
            <button className="button button--ghost" type="button" onClick={resetForm} disabled={isUploading}>
              Очистить форму
            </button>
          </div>
        </form>

        <div className="owner-editor-card owner-editor-list">
          <div className="owner-editor-list__head owner-editor-list__head--stack">
            <div>
              <strong>{activeCategory?.title ?? 'Карточки категории'}</strong>
              <span>{visibleItems.length} шт.</span>
            </div>
            <span>
              Здесь видно статус карточки, порядок показа и заполнена ли ссылка на карту.
            </span>
          </div>

          <div className="owner-item-list">
            {visibleItems.length > 0 ? (
              visibleItems.map((item) => {
                const itemStatus = statusMeta[item.status || 'published'];
                const imageCount = getPlaceImages(item).length;
                const hasMapLink = Boolean((item.mapQuery || item.address || '').trim());

                return (
                  <article key={item.id} className="owner-item-card">
                    <div className="owner-item-card__top">
                      <div>
                        <div className="owner-item-card__badges">
                          <span className={`owner-status-pill ${itemStatus.className}`}>{itemStatus.label}</span>
                          <span className="owner-meta-pill">Порядок {item.sortOrder ?? 100}</span>
                          {item.top ? <span className="owner-meta-pill owner-meta-pill--accent">Топ</span> : null}
                        </div>
                        <h3>{item.title}</h3>
                        <p>
                          {activeCategory?.title ?? item.categoryId} · {item.kind || 'Без типа'}
                        </p>
                      </div>
                      <span className="owner-item-card__rating">★ {item.rating.toFixed(1)}</span>
                    </div>

                    <p className="owner-item-card__address">{item.address}</p>
                    <p className="owner-item-card__description">{item.description}</p>
                    <p className="owner-item-card__meta-row">
                      {[typeof item.hotelStars === 'number' ? `${item.hotelStars}★` : '', item.hotelPool ? 'Бассейн' : '', item.hotelSpa ? 'СПА' : '', item.cuisine, ...(item.services ?? []), ...(item.tags ?? [])].filter(Boolean).join(' · ')}
                    </p>
                    <div className="owner-item-card__stats">
                      <span>Фото: {imageCount}</span>
                      <span>Карта: {hasMapLink ? 'ссылка добавлена' : 'ссылка не задана'}</span>
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
                );
              })
            ) : (
              <article className="owner-item-card">
                <h3>Пока пусто</h3>
                <p>
                  В категории “{activeCategory?.title ?? 'Раздел'}” ещё нет карточек. Добавь первую карточку
                  через форму слева — она сразу появится в этой вкладке.
                </p>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
