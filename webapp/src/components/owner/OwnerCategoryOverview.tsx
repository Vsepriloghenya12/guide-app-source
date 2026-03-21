import { ChangeEvent, useState } from 'react';
import { categoryStatusMap } from '../../data/categories';
import { updateGuideContent } from '../../data/guideContent';
import type { GuideCategory } from '../../types';
import { uploadImageAsset } from '../../utils/imageUpload';
import { CategoryIcon } from '../common/CategoryIcon';

type OwnerCategoryOverviewProps = {
  categories: GuideCategory[];
};

function parseCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function OwnerCategoryOverview({ categories }: OwnerCategoryOverviewProps) {
  const [status, setStatus] = useState('');
  const [uploadingCategoryId, setUploadingCategoryId] = useState<string | null>(null);

  const handleCategoryField = <K extends keyof GuideCategory>(
    categoryId: string,
    field: K,
    value: GuideCategory[K]
  ) => {
    updateGuideContent((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === categoryId ? { ...category, [field]: value } : category
      )
    }));
  };

  const handleCategoryFilterField = (categoryId: string, field: 'quickFilters' | 'fields', value: string) => {
    updateGuideContent((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              filterSchema: {
                ...category.filterSchema,
                [field]: parseCsv(value)
              }
            }
          : category
      )
    }));
  };

  const handleCategoryImage = async (categoryId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingCategoryId(categoryId);
    setStatus('Загружаю обложку категории...');

    try {
      const imageSrc = await uploadImageAsset(file, 'category', { maxWidth: 1600, maxHeight: 1200, quality: 0.84 });
      handleCategoryField(categoryId, 'imageSrc', imageSrc);
      setStatus('Обложка категории обновлена.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось загрузить обложку категории.');
    } finally {
      setUploadingCategoryId(null);
      event.target.value = '';
    }
  };

  const sortedCategories = [...categories].sort((left, right) => (left.sortOrder ?? 1000) - (right.sortOrder ?? 1000));

  return (
    <section className="owner-category-manager owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / категории</span>
          <h2>Управление категориями</h2>
          <p>Здесь можно менять названия, медиа, фильтры, порядок показа и видимость категорий.</p>
        </div>
      </div>

      {status ? <div className="owner-editor-status owner-editor-status--spaced">{status}</div> : null}

      <div className="owner-category-list owner-category-list--editable">
        {sortedCategories.map((category) => (
          <article key={category.id} className="owner-category-card owner-category-card--editable">
            <div className="owner-category-card__top owner-category-card__top--stack">
              <div className="owner-category-card__title-row">
                <CategoryIcon categoryId={category.id} size="md" className="owner-category-card__icon" />
                <div className="owner-category-card__title-wrap">
                  <h3>{category.title}</h3>
                  <p>{categoryStatusMap[category.id]}</p>
                </div>
              </div>

              <div className="owner-category-card__media">
                {category.imageSrc ? (
                  <img src={category.imageSrc} alt={category.title} className="owner-category-card__preview" />
                ) : (
                  <div className="owner-category-card__preview owner-category-card__preview--empty">
                    Нет обложки
                  </div>
                )}
                <label className="button button--ghost owner-upload-button">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={(event) => handleCategoryImage(category.id, event)}
                  />
                  {uploadingCategoryId === category.id ? 'Загрузка...' : 'Загрузить обложку'}
                </label>
              </div>
            </div>

            <div className="owner-editor-form__grid owner-editor-form__grid--double">
              <label className="field">
                <span>Название категории</span>
                <input
                  value={category.title}
                  onChange={(event) => handleCategoryField(category.id, 'title', event.target.value)}
                />
              </label>

              <label className="field">
                <span>Короткое название</span>
                <input
                  value={category.shortTitle}
                  onChange={(event) => handleCategoryField(category.id, 'shortTitle', event.target.value)}
                />
              </label>

              <label className="field">
                <span>Бейдж</span>
                <input
                  value={category.badge ?? ''}
                  onChange={(event) => handleCategoryField(category.id, 'badge', event.target.value)}
                  placeholder="Например, Популярно"
                />
              </label>

              <label className="field">
                <span>Акцент</span>
                <select
                  value={category.accent}
                  onChange={(event) => handleCategoryField(category.id, 'accent', event.target.value)}
                >
                  <option value="coast">Coast</option>
                  <option value="bridge">Bridge</option>
                  <option value="sunset">Sunset</option>
                  <option value="emerald">Emerald</option>
                </select>
              </label>

              <label className="field">
                <span>Ссылка</span>
                <input
                  value={category.path}
                  onChange={(event) => handleCategoryField(category.id, 'path', event.target.value)}
                />
              </label>

              <label className="field">
                <span>Slug</span>
                <input
                  value={category.slug}
                  onChange={(event) => handleCategoryField(category.id, 'slug', event.target.value)}
                />
              </label>

              <label className="field field--full">
                <span>Описание</span>
                <input
                  value={category.description ?? ''}
                  onChange={(event) => handleCategoryField(category.id, 'description', event.target.value)}
                />
              </label>

              <label className="field">
                <span>Порядок показа</span>
                <input
                  type="number"
                  value={category.sortOrder ?? 100}
                  onChange={(event) => handleCategoryField(category.id, 'sortOrder', Number(event.target.value) || 100)}
                />
              </label>

              <label className="field">
                <span>Quick filters</span>
                <input
                  value={(category.filterSchema?.quickFilters ?? []).join(', ')}
                  onChange={(event) => handleCategoryFilterField(category.id, 'quickFilters', event.target.value)}
                  placeholder="breakfast, vegan, pets"
                />
              </label>

              <label className="field field--full">
                <span>Fields</span>
                <input
                  value={(category.filterSchema?.fields ?? []).join(', ')}
                  onChange={(event) => handleCategoryFilterField(category.id, 'fields', event.target.value)}
                  placeholder="avgCheck, cuisine, services, tags"
                />
              </label>
            </div>

            <div className="owner-checkbox-grid">
              <label className="checkbox-pill checkbox-pill--owner">
                <input
                  type="checkbox"
                  checked={category.visible}
                  onChange={(event) => handleCategoryField(category.id, 'visible', event.target.checked)}
                />
                <span>Показывать в общем списке</span>
              </label>

              <label className="checkbox-pill checkbox-pill--owner">
                <input
                  type="checkbox"
                  checked={category.showOnHome}
                  onChange={(event) => handleCategoryField(category.id, 'showOnHome', event.target.checked)}
                />
                <span>Показывать в блоке “Категории”</span>
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
