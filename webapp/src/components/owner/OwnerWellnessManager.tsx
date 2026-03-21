import { FormEvent, useMemo, useState } from 'react';
import { saveWellnessItems } from '../../data/guideContent';
import type { WellnessItem } from '../../types';

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
};

const serviceOptions: Array<{ value: WellnessItem['services'][number]; label: string }> = [
  { value: 'massage', label: 'Массажные салоны' },
  { value: 'sauna', label: 'Баня' },
  { value: 'spa', label: 'СПА комплексы' },
  { value: 'hammam', label: 'Хамам' },
  { value: 'cosmetology', label: 'Косметология' },
  { value: 'wraps', label: 'Обертывания' },
  { value: 'yoga', label: 'Йога' }
];

const initialDraft: WellnessDraft = {
  title: '',
  services: [],
  childPrograms: false,
  address: '',
  description: '',
  rating: '4.8',
  imageLabel: ''
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
    imageLabel: item.imageLabel
  };
}

export function OwnerWellnessManager({ items }: OwnerWellnessManagerProps) {
  const [draft, setDraft] = useState<WellnessDraft>(initialDraft);
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

  const toggleService = (value: WellnessItem['services'][number], checked: boolean) => {
    setDraft((current) => ({
      ...current,
      services: checked
        ? [...current.services, value]
        : current.services.filter((item) => item !== value)
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextItem: WellnessItem = {
      id: draft.id || createId(),
      title: draft.title.trim(),
      services: draft.services,
      childPrograms: draft.childPrograms,
      address: draft.address.trim(),
      description: draft.description.trim(),
      rating: Number(draft.rating || 0),
      imageLabel: draft.imageLabel.trim() || 'Новая СПА карточка'
    };

    if (!nextItem.title || !nextItem.address || !nextItem.description || nextItem.services.length === 0) {
      setStatus('Заполни название, адрес, описание и выбери хотя бы одну услугу.');
      return;
    }

    const nextItems = draft.id
      ? items.map((item) => (item.id === draft.id ? nextItem : item))
      : [nextItem, ...items];

    saveWellnessItems(nextItems);
    setStatus(draft.id ? 'СПА-карточка обновлена.' : 'Новая СПА-карточка добавлена.');
    resetForm();
  };

  const startEdit = (item: WellnessItem) => {
    setDraft(toDraft(item));
    setIsEditing(true);
    setStatus('');
  };

  const deleteItem = (id: string) => {
    saveWellnessItems(items.filter((item) => item.id !== id));
    if (draft.id === id) {
      resetForm();
    }
    setStatus('СПА-карточка удалена.');
  };

  return (
    <section className="owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / spa</span>
          <h2>Добавление и редактирование СПА и оздоровления</h2>
          <p>Карточки из этого модуля сразу отображаются в публичном разделе СПА и оздоровления.</p>
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
              placeholder="Например, Морской проспект, 5"
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
              placeholder="Опиши форматы отдыха, атмосферу и ключевые услуги"
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
                    <p>{item.services.map((service) => serviceOptions.find((option) => option.value === service)?.label || service).join(' · ')}</p>
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
