import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { updateGuideContent } from '../../data/guideContent';
import type { GuidePlace } from '../../types';

type OwnerPlacesManagerProps = {
  items: GuidePlace[];
};

type PlaceDraft = {
  id?: string;
  categoryId: GuidePlace['categoryId'];
  title: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  avgCheck: string;
  kind: string;
  cuisine: string;
  services: string;
  tags: string;
  breakfast: boolean;
  vegan: boolean;
  pets: boolean;
  childPrograms: boolean;
  top: boolean;
  rating: string;
  imageLabel: string;
  imageSrc: string;
};

const initialDraft: PlaceDraft = {
  categoryId: 'restaurants',
  title: '',
  description: '',
  address: '',
  phone: '',
  website: '',
  hours: '',
  avgCheck: '',
  kind: '',
  cuisine: '',
  services: '',
  tags: '',
  breakfast: false,
  vegan: false,
  pets: false,
  childPrograms: false,
  top: false,
  rating: '4.7',
  imageLabel: '',
  imageSrc: ''
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

function toDraft(item: GuidePlace): PlaceDraft {
  return {
    id: item.id,
    categoryId: item.categoryId,
    title: item.title,
    description: item.description,
    address: item.address,
    phone: item.phone,
    website: item.website,
    hours: item.hours,
    avgCheck: item.avgCheck ? String(item.avgCheck) : '',
    kind: item.kind,
    cuisine: item.cuisine,
    services: item.services.join(', '),
    tags: item.tags.join(', '),
    breakfast: item.breakfast,
    vegan: item.vegan,
    pets: item.pets,
    childPrograms: item.childPrograms,
    top: item.top,
    rating: String(item.rating),
    imageLabel: item.imageLabel,
    imageSrc: item.imageSrc
  };
}

export function OwnerPlacesManager({ items }: OwnerPlacesManagerProps) {
  const [draft, setDraft] = useState<PlaceDraft>(initialDraft);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'restaurants' | 'wellness'>('all');

  const visibleItems = useMemo(() => {
    const sorted = [...items].sort((left, right) => {
      if (left.top !== right.top) {
        return Number(right.top) - Number(left.top);
      }
      return right.rating - left.rating;
    });

    if (activeTab === 'all') {
      return sorted;
    }

    return sorted.filter((item) => item.categoryId === activeTab);
  }, [activeTab, items]);

  const resetForm = () => {
    setDraft(initialDraft);
    setIsEditing(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextItem: GuidePlace = {
      id: draft.id || createId(),
      categoryId: draft.categoryId,
      title: draft.title.trim(),
      description: draft.description.trim(),
      address: draft.address.trim(),
      phone: draft.phone.trim(),
      website: draft.website.trim(),
      hours: draft.hours.trim(),
      avgCheck: draft.avgCheck ? Number(draft.avgCheck) : undefined,
      kind: draft.kind.trim(),
      cuisine: draft.cuisine.trim(),
      services: parseMultiValue(draft.services),
      tags: parseMultiValue(draft.tags),
      breakfast: draft.breakfast,
      vegan: draft.vegan,
      pets: draft.pets,
      childPrograms: draft.childPrograms,
      top: draft.top,
      rating: Number(draft.rating || 0),
      imageLabel: draft.imageLabel.trim() || 'Карточка места',
      imageSrc: draft.imageSrc
    };

    if (!nextItem.title || !nextItem.address || !nextItem.description) {
      setStatus('Заполни название, адрес и описание карточки.');
      return;
    }

    updateGuideContent((current) => ({
      ...current,
      places: draft.id
        ? current.places.map((item) => (item.id === draft.id ? nextItem : item))
        : [nextItem, ...current.places]
    }));

    setStatus(draft.id ? 'Карточка обновлена.' : 'Новая карточка добавлена.');
    resetForm();
  };

  const startEdit = (item: GuidePlace) => {
    setDraft(toDraft(item));
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
      resetForm();
    }

    setStatus('Карточка удалена.');
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        imageSrc: typeof reader.result === 'string' ? reader.result : current.imageSrc,
        imageLabel: current.imageLabel || file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / карточки</span>
          <h2>Карточки мест</h2>
          <p>
            Здесь уже есть полноценная форма: фото, категория, описание, контакты, часы работы,
            средний чек, тип, услуги, теги и переключатель “показывать в топе”.
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
                <option value="restaurants">Рестораны</option>
                <option value="wellness">СПА и оздоровление</option>
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
            <span>Фото</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>

          {draft.imageSrc ? (
            <div className="owner-image-preview">
              <img src={draft.imageSrc} alt={draft.title || 'Превью'} />
              <button
                className="button button--ghost"
                type="button"
                onClick={() => setDraft((current) => ({ ...current, imageSrc: '' }))}
              >
                Удалить фото
              </button>
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
              <span>Есть веган-меню</span>
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
                checked={draft.childPrograms}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, childPrograms: event.target.checked }))
                }
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
            <button className="button button--primary" type="submit">
              {isEditing ? 'Сохранить изменения' : 'Добавить карточку'}
            </button>
            <button className="button button--ghost" type="button" onClick={resetForm}>
              Очистить форму
            </button>
          </div>
        </form>

        <div className="owner-editor-card owner-editor-list">
          <div className="owner-editor-list__head owner-editor-list__head--stack">
            <div>
              <strong>Карточки в системе</strong>
              <span>{items.length} шт.</span>
            </div>
            <div className="owner-inline-tabs">
              {[
                { value: 'all', label: 'Все' },
                { value: 'restaurants', label: 'Рестораны' },
                { value: 'wellness', label: 'СПА' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={`button button--ghost ${activeTab === tab.value ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab.value as 'all' | 'restaurants' | 'wellness')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="owner-item-list">
            {visibleItems.map((item) => (
              <article key={item.id} className="owner-item-card">
                <div className="owner-item-card__top">
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      {item.categoryId === 'restaurants' ? 'Рестораны' : 'СПА'} · {item.kind || 'Без типа'}
                      {item.top ? ' · Топ' : ''}
                    </p>
                  </div>
                  <span className="owner-item-card__rating">★ {item.rating.toFixed(1)}</span>
                </div>

                <p className="owner-item-card__address">{item.address}</p>
                <p className="owner-item-card__description">{item.description}</p>
                <p className="owner-item-card__meta-row">
                  {[item.cuisine, ...(item.services ?? []), ...(item.tags ?? [])].filter(Boolean).join(' · ')}
                </p>

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
