import { categoryStatusMap } from '../../data/categories';
import { updateGuideContent } from '../../data/guideContent';
import type { GuideCategory } from '../../types';

type OwnerCategoryOverviewProps = {
  categories: GuideCategory[];
};

export function OwnerCategoryOverview({ categories }: OwnerCategoryOverviewProps) {
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

  return (
    <section className="owner-category-manager owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / категории</span>
          <h2>Управление категориями</h2>
          <p>Здесь можно менять названия, бейджи, видимость и показ категорий на главной странице.</p>
        </div>
      </div>

      <div className="owner-category-list owner-category-list--editable">
        {categories.map((category) => (
          <article key={category.id} className="owner-category-card owner-category-card--editable">
            <div className="owner-category-card__top owner-category-card__top--stack">
              <div className="owner-category-card__title-wrap">
                <h3>{category.title}</h3>
                <p>{categoryStatusMap[category.id]}</p>
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
                <span>Бейдж</span>
                <input
                  value={category.badge ?? ''}
                  onChange={(event) => handleCategoryField(category.id, 'badge', event.target.value)}
                  placeholder="Например, Популярно"
                />
              </label>

              <label className="field">
                <span>Ссылка</span>
                <input
                  value={category.path}
                  onChange={(event) => handleCategoryField(category.id, 'path', event.target.value)}
                />
              </label>

              <label className="field">
                <span>Описание</span>
                <input
                  value={category.description ?? ''}
                  onChange={(event) =>
                    handleCategoryField(category.id, 'description', event.target.value)
                  }
                />
              </label>
            </div>

            <div className="owner-checkbox-grid">
              <label className="checkbox-pill checkbox-pill--owner">
                <input
                  type="checkbox"
                  checked={category.visible}
                  onChange={(event) =>
                    handleCategoryField(category.id, 'visible', event.target.checked)
                  }
                />
                <span>Показывать в общем списке</span>
              </label>

              <label className="checkbox-pill checkbox-pill--owner">
                <input
                  type="checkbox"
                  checked={category.showOnHome}
                  onChange={(event) =>
                    handleCategoryField(category.id, 'showOnHome', event.target.checked)
                  }
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
