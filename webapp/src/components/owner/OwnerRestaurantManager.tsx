import { FormEvent, useMemo, useState } from 'react';
import { saveRestaurants } from '../../data/guideContent';
import type { RestaurantItem } from '../../types';

type OwnerRestaurantManagerProps = {
  items: RestaurantItem[];
};

type RestaurantDraft = {
  id?: string;
  title: string;
  kind: RestaurantItem['kind'];
  cuisine: RestaurantItem['cuisine'];
  breakfast: boolean;
  vegan: boolean;
  pets: boolean;
  avgCheck: string;
  address: string;
  description: string;
  rating: string;
  imageLabel: string;
};

const initialDraft: RestaurantDraft = {
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
  imageLabel: ''
};

const kindLabelMap: Record<RestaurantItem['kind'], string> = {
  restaurant: 'Ресторан',
  club: 'Клуб',
  canteen: 'Столовая',
  coffee: 'Кофейня'
};

const cuisineLabelMap: Record<RestaurantItem['cuisine'], string> = {
  european: 'Европейская',
  caucasian: 'Кавказская',
  thai: 'Тайская',
  vietnamese: 'Вьетнамская'
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
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
    imageLabel: item.imageLabel
  };
}

export function OwnerRestaurantManager({ items }: OwnerRestaurantManagerProps) {
  const [draft, setDraft] = useState<RestaurantDraft>(initialDraft);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');

  const sortedItems = useMemo(
    () => [...items].sort((left, right) => right.rating - left.rating),
    [items]
  );

  const resetForm = () => {
    setDraft(initialDraft);
    setIsEditing(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
      imageLabel: draft.imageLabel.trim() || 'Новая карточка'
    };

    if (!nextItem.title || !nextItem.address || !nextItem.description) {
      setStatus('Заполни название, адрес и описание карточки.');
      return;
    }

    const nextItems = draft.id
      ? items.map((item) => (item.id === draft.id ? nextItem : item))
      : [nextItem, ...items];

    saveRestaurants(nextItems);
    setStatus(draft.id ? 'Карточка ресторана обновлена.' : 'Новая карточка ресторана добавлена.');
    resetForm();
  };

  const startEdit = (item: RestaurantItem) => {
    setDraft(toDraft(item));
    setIsEditing(true);
    setStatus('');
  };

  const deleteItem = (id: string) => {
    saveRestaurants(items.filter((item) => item.id !== id));
    if (draft.id === id) {
      resetForm();
    }
    setStatus('Карточка ресторана удалена.');
  };

  return (
    <section className="owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / рестораны</span>
          <h2>Добавление и редактирование ресторанов</h2>
          <p>Все изменения сразу сохраняются локально и появляются в публичном разделе ресторанов.</p>
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
                onChange={(event) =>
                  setDraft((current) => ({ ...current, kind: event.target.value as RestaurantItem['kind'] }))
                }
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
                  setDraft((current) => ({
                    ...current,
                    cuisine: event.target.value as RestaurantItem['cuisine']
                  }))
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
                placeholder="Например, 650"
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
                placeholder="4.8"
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

          <label className="field field--textarea">
            <span>Описание</span>
            <textarea
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
              rows={5}
              placeholder="Коротко опиши атмосферу, кухню и особенности места"
            />
          </label>

          <div className="owner-checkbox-grid">
            <label className="checkbox-pill checkbox-pill--owner">
              <input
                type="checkbox"
                checked={draft.breakfast}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, breakfast: event.target.checked }))
                }
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
                      {kindLabelMap[item.kind]} · {cuisineLabelMap[item.cuisine]} · чек {item.avgCheck}
                    </p>
                  </div>
                  <span className="owner-item-card__rating">★ {item.rating.toFixed(1)}</span>
                </div>

                <p className="owner-item-card__address">{item.address}</p>
                <p className="owner-item-card__description">{item.description}</p>

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
