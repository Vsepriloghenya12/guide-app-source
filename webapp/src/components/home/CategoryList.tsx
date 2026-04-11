import { Link } from 'react-router-dom';
import type { GuideCategory } from '../../types';
import { recordGuideAnalytics } from '../../utils/analytics';
import { getCategoryListImage, getCategoryTone } from './homeVisuals';

type CategoryListProps = {
  categories: GuideCategory[];
  title: string;
};

export function CategoryList({ categories, title }: CategoryListProps) {
  return (
    <section className="travel-section travel-section--directory travel-section--directory-home" id="all-categories">
      <div className="travel-section__header travel-section__header--home">
        <h2>{title}</h2>
      </div>

      <div className="travel-directory-list travel-directory-list--stripes" role="list">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            to={category.path}
            className="travel-directory-row"
            data-tone={getCategoryTone(category)}
            role="listitem"
            onClick={() =>
              recordGuideAnalytics({
                kind: 'category-click',
                label: category.title,
                path: category.path,
                entityId: category.id,
                categoryId: category.id
              })
            }
          >
            <span className="travel-directory-row__body">
              {category.badge ? <span className="travel-directory-row__eyebrow">{category.badge}</span> : null}
              <span className="travel-directory-row__title">{category.shortTitle || category.title}</span>
              {category.description ? <span className="travel-directory-row__text">{category.description}</span> : null}
            </span>
            <span className="travel-directory-row__media" aria-hidden="true">
              <img src={getCategoryListImage(category, index)} alt="" loading="lazy" decoding="async" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
