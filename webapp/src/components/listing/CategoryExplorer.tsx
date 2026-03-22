import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterPanel } from '../common/FilterPanel';
import { PlaceholderCard } from '../common/PlaceholderCard';
import { PageHeader } from '../layout/PageHeader';
import { defaultCategories } from '../../data/categories';
import { useGuideContent } from '../../hooks/useGuideContent';
import { usePageMeta } from '../../hooks/usePageMeta';
import { comparePlacesByPriority } from '../../utils/places';
import type { GuideCategory, GuideCategoryId, GuidePlace, GuideTip, GuideCollection } from '../../types';

type CategoryExplorerProps = {
  categoryId?: GuideCategoryId;
  categorySlug?: string;
};

type SortMode = 'priority' | 'rating' | 'alphabet' | 'check-low' | 'check-high';

type FiltersState = {
  kind: string;
  cuisine: string;
  district: string;
  minCheck: string;
  maxCheck: string;
  selectedServices: string[];
  selectedTags: string[];
  sortMode: SortMode;
};

const initialFilters: FiltersState = {
  kind: 'all',
  cuisine: 'all',
  district: 'all',
  minCheck: '',
  maxCheck: '',
  selectedServices: [],
  selectedTags: [],
  sortMode: 'priority'
};

function compactStrings(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value));
}

function getPlaceImages(item: GuidePlace) {
  if (Array.isArray(item.imageGallery) && item.imageGallery.length > 0) {
    return item.imageGallery;
  }
  return item.imageSrc ? [item.imageSrc] : [];
}

function toLabel(filterKey: string) {
  const map: Record<string, string> = {
    avgCheck: 'Средний чек',
    kind: 'Тип',
    cuisine: 'Кухня',
    services: 'Услуги',
    tags: 'Теги',
    district: 'Район'
  };

  return map[filterKey] || filterKey;
}

function sortPlaces<T extends GuidePlace>(places: T[], sortMode: SortMode): T[] {
  if (sortMode === 'priority') {
    return [...places].sort(comparePlacesByPriority);
  }

  return [...places].sort((left, right) => {
    switch (sortMode) {
      case 'rating':
        return Number(right.rating || 0) - Number(left.rating || 0);
      case 'alphabet':
        return String(left.title || '').localeCompare(String(right.title || ''), 'ru');
      case 'check-low':
        return Number(left.avgCheck || 0) - Number(right.avgCheck || 0);
      case 'check-high':
        return Number(right.avgCheck || 0) - Number(left.avgCheck || 0);
      default:
        return comparePlacesByPriority(left, right);
    }
  });
}

function mergeCategoryWithFallback(category?: GuideCategory | null) {
  if (!category) {
    return null;
  }

  const fallback = defaultCategories.find((item) => item.id === category.id || item.slug === category.slug);

  if (!fallback) {
    return category;
  }

  return {
    ...fallback,
    ...category,
    filterSchema: {
      quickFilters: category.filterSchema?.quickFilters?.length ? category.filterSchema.quickFilters : fallback.filterSchema?.quickFilters || [],
      fields: category.filterSchema?.fields?.length ? category.filterSchema.fields : fallback.filterSchema?.fields || []
    },
    imageSrc: category.imageSrc || fallback.imageSrc || '',
    description: category.description || fallback.description || '',
    shortTitle: category.shortTitle || fallback.shortTitle,
    accent: category.accent || fallback.accent,
    path: category.path || fallback.path,
    slug: category.slug || fallback.slug
  } satisfies GuideCategory;
}

function toggleInArray(values: string[], target: string) {
  return values.includes(target) ? values.filter((value) => value !== target) : [...values, target];
}

function isNonEmptyString(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function CategoryExplorer({ categoryId, categorySlug }: CategoryExplorerProps) {
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const { categories, places, tips, collections, loading, error } = useGuideContent();

  const rawCategory = useMemo(
    () =>
      categories.find((item) => {
        if (categoryId) {
          return item.id === categoryId;
        }
        return item.slug === categorySlug || item.id === categorySlug;
      }) || null,
    [categories, categoryId, categorySlug]
  );

  const category = useMemo(() => mergeCategoryWithFallback(rawCategory), [rawCategory]);

  usePageMeta({
    title: category ? category.title : 'Раздел не найден',
    description: category?.description || 'Подборка мест и полезной информации по этому разделу.'
  });

  const categoryPlaces = useMemo(() => {
    if (!category) {
      return [];
    }

    return places.filter((place) => place.categoryId === category.id && place.status === 'published');
  }, [places, category]);

  const filterFields = category?.filterSchema?.fields || [];

  const kindOptions = useMemo(
    () => Array.from(new Set(categoryPlaces.map((item) => item.kind).filter(isNonEmptyString))).sort((a, b) => a.localeCompare(b, 'ru')),
    [categoryPlaces]
  );
  const cuisineOptions = useMemo(
    () => Array.from(new Set(categoryPlaces.map((item) => item.cuisine).filter(isNonEmptyString))).sort((a, b) => a.localeCompare(b, 'ru')),
    [categoryPlaces]
  );
  const districtOptions = useMemo(
    () => Array.from(new Set(categoryPlaces.map((item) => item.district).filter(isNonEmptyString))).sort((a, b) => a.localeCompare(b, 'ru')),
    [categoryPlaces]
  );
  const serviceOptions = useMemo(
    () => Array.from(new Set(categoryPlaces.flatMap((item) => item.services || []).filter(isNonEmptyString))).sort((a, b) => a.localeCompare(b, 'ru')),
    [categoryPlaces]
  );
  const tagOptions = useMemo(
    () => Array.from(new Set(categoryPlaces.flatMap((item) => item.tags || []).filter(isNonEmptyString))).sort((a, b) => a.localeCompare(b, 'ru')),
    [categoryPlaces]
  );

  const filteredPlaces = useMemo(() => {
    const nextPlaces = categoryPlaces.filter((place) => {
      if (filters.kind !== 'all' && place.kind !== filters.kind) {
        return false;
      }

      if (filters.cuisine !== 'all' && place.cuisine !== filters.cuisine) {
        return false;
      }

      if (filters.district !== 'all' && (place.district || '') !== filters.district) {
        return false;
      }

      const minCheck = Number(filters.minCheck || 0);
      const maxCheck = Number(filters.maxCheck || 0);
      if (minCheck > 0 && Number(place.avgCheck || 0) < minCheck) {
        return false;
      }
      if (maxCheck > 0 && Number(place.avgCheck || 0) > maxCheck) {
        return false;
      }

      if (filters.selectedServices.length > 0 && !filters.selectedServices.every((service) => place.services?.includes(service))) {
        return false;
      }

      if (filters.selectedTags.length > 0 && !filters.selectedTags.every((tag) => place.tags?.includes(tag))) {
        return false;
      }

      return true;
    });

    return sortPlaces(nextPlaces, filters.sortMode);
  }, [categoryPlaces, filters]);

  const activeFiltersCount =
    filters.selectedServices.length +
    filters.selectedTags.length +
    Number(filters.kind !== 'all') +
    Number(filters.cuisine !== 'all') +
    Number(filters.district !== 'all') +
    Number(Boolean(filters.minCheck)) +
    Number(Boolean(filters.maxCheck));

  const relatedTips = useMemo(
    () =>
      tips.filter((tip: GuideTip) => tip.active && category && (tip.linkPath === category.path || tip.linkPath.endsWith(`/${category.slug}`) || tip.linkPath.endsWith(`/${category.id}`))).slice(0, 2),
    [tips, category]
  );

  const relatedCollections = useMemo(
    () =>
      collections.filter((collection: GuideCollection) => category && collection.active && (collection.linkPath === category.path || collection.linkPath.endsWith(`/${category.slug}`) || collection.linkPath.endsWith(`/${category.id}`))).slice(0, 2),
    [collections, category]
  );

  if (!category) {
    return (
      <div className="page-stack">
        <PageHeader title="Раздел не найден" subtitle="Возможно, категория скрыта или ещё не создана." showBack />
      </div>
    );
  }

  const eventHighlights = category.id === 'events' ? sortPlaces(categoryPlaces, 'priority').slice(0, 3) : [];

  return (
    <div className="page-stack category-explorer-page">
      <PageHeader
        title={category.title}
        subtitle={category.description || 'Подборка мест и полезной информации по этому разделу.'}
        showBack
        badgeLabel={category.shortTitle}
      />

      <section className={`panel category-hero category-hero--${category.accent || 'coast'}`}>
        <div className="category-hero__content">
          <div className="chip-row chip-row--wrap">
            <span className="chip">{category.shortTitle}</span>
            {category.badge ? <span className="chip chip--soft">{category.badge}</span> : null}
          </div>
          <h2>{category.title}</h2>
          <p>{categoryPlaces.length > 0 ? 'Собрали всё важное по этому разделу в одном месте.' : 'Раздел открыт и готов к наполнению.'}</p>
        </div>

        {category.imageSrc ? (
          <div className="category-hero__cover" style={{ backgroundImage: `url(${category.imageSrc})` }} aria-hidden="true" />
        ) : (
          <div className="category-hero__cover category-hero__cover--empty" aria-hidden="true">
            <span>{category.shortTitle}</span>
          </div>
        )}
      </section>

      {category.id === 'events' && eventHighlights.length > 0 ? (
        <section className="panel event-highlights-panel">
          <div className="section-headline">
            <strong>Скоро в городе</strong>
            <span>Ближайшие события этого раздела.</span>
          </div>
          <div className="event-highlight-grid">
            {eventHighlights.map((event) => (
              <Link key={event.id} to={`/place/${event.slug || `${event.categoryId}-${event.id}`}`} className="event-highlight-card">
                <strong>{event.title}</strong>
                <span>{[event.hours, event.address || event.district].filter(Boolean).join(' · ')}</span>
                <small>{[event.kind, ...(event.tags || []).slice(0, 2)].filter(Boolean).join(' · ')}</small>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {filterFields.length > 0 ? (
        <FilterPanel title={`Фильтры · ${category.shortTitle}`}>
          <div className="filter-stack">
            {filterFields.includes('kind') && kindOptions.length > 0 ? (
              <label className="field field--grow">
                <span>{toLabel('kind')}</span>
                <select value={filters.kind} onChange={(event) => setFilters((current) => ({ ...current, kind: event.target.value }))}>
                  <option value="all">Все</option>
                  {kindOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {filterFields.includes('cuisine') && cuisineOptions.length > 0 ? (
              <label className="field field--grow">
                <span>{toLabel('cuisine')}</span>
                <select value={filters.cuisine} onChange={(event) => setFilters((current) => ({ ...current, cuisine: event.target.value }))}>
                  <option value="all">Все</option>
                  {cuisineOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {filterFields.includes('district') && districtOptions.length > 0 ? (
              <label className="field field--grow">
                <span>{toLabel('district')}</span>
                <select value={filters.district} onChange={(event) => setFilters((current) => ({ ...current, district: event.target.value }))}>
                  <option value="all">Все районы</option>
                  {districtOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {filterFields.includes('avgCheck') ? (
              <div className="filter-grid-two">
                <label className="field field--grow">
                  <span>Мин. чек</span>
                  <input value={filters.minCheck} onChange={(event) => setFilters((current) => ({ ...current, minCheck: event.target.value }))} inputMode="numeric" placeholder="от" />
                </label>
                <label className="field field--grow">
                  <span>Макс. чек</span>
                  <input value={filters.maxCheck} onChange={(event) => setFilters((current) => ({ ...current, maxCheck: event.target.value }))} inputMode="numeric" placeholder="до" />
                </label>
              </div>
            ) : null}

            {filterFields.includes('services') && serviceOptions.length > 0 ? (
              <div className="field-group">
                <span className="field-group__label">{toLabel('services')}</span>
                <div className="chip-row chip-row--wrap">
                  {serviceOptions.map((service) => (
                    <button
                      key={service}
                      type="button"
                      className={`chip chip--action ${filters.selectedServices.includes(service) ? 'is-active' : ''}`}
                      onClick={() => setFilters((current) => ({ ...current, selectedServices: toggleInArray(current.selectedServices, service) }))}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {filterFields.includes('tags') && tagOptions.length > 0 ? (
              <div className="field-group">
                <span className="field-group__label">{toLabel('tags')}</span>
                <div className="chip-row chip-row--wrap">
                  {tagOptions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`chip chip--action ${filters.selectedTags.includes(tag) ? 'is-active' : ''}`}
                      onClick={() => setFilters((current) => ({ ...current, selectedTags: toggleInArray(current.selectedTags, tag) }))}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="filter-actions">
              <button className="button button--ghost" type="button" onClick={() => setFilters(initialFilters)}>
                Сбросить всё
              </button>
            </div>
          </div>
        </FilterPanel>
      ) : null}

      <section className="panel category-toolbar">
        <div className="section-headline section-headline--muted">
          <strong>{filteredPlaces.length} результатов</strong>
          {activeFiltersCount > 0 ? <span>Активно фильтров: {activeFiltersCount}</span> : <span>Без активных фильтров</span>}
        </div>
        <label className="field field--compact">
          <span>Сортировка</span>
          <select value={filters.sortMode} onChange={(event) => setFilters((current) => ({ ...current, sortMode: event.target.value as SortMode }))}>
            <option value="priority">По приоритету</option>
            <option value="rating">По рейтингу</option>
            <option value="alphabet">По алфавиту</option>
            <option value="check-low">Сначала дешевле</option>
            <option value="check-high">Сначала дороже</option>
          </select>
        </label>
      </section>

      {loading ? <div className="panel page-loader">Загружаю карточки раздела…</div> : null}
      {error ? (
        <div className="panel empty-state empty-state--left">
          <strong>Не удалось обновить раздел</strong>
          <p>{error}</p>
        </div>
      ) : null}

      {!loading && filteredPlaces.length > 0 ? (
        <section className="grid-listing">
          {filteredPlaces.map((item) => (
            <PlaceholderCard
              key={item.id}
              title={item.title}
              address={item.address}
              description={item.description}
              rating={item.rating}
              imageLabel={item.imageLabel}
              imageSrc={item.imageSrc}
              imageSources={getPlaceImages(item)}
              phone={item.phone}
              website={item.website}
              hours={item.hours}
              top={item.top}
              detailPath={`/place/${item.slug || `${item.categoryId}-${item.id}`}`}
              analytics={{ placeId: item.id, categoryId: item.categoryId }}
              meta={compactStrings([
                item.kind,
                item.cuisine,
                item.avgCheck ? `Средний чек ${item.avgCheck}` : undefined,
                item.district,
                ...item.services,
                ...item.tags
              ])}
            />
          ))}
        </section>
      ) : null}

      {!loading && filteredPlaces.length === 0 ? (
        <section className="panel empty-state empty-state--left">
          <strong>{categoryPlaces.length > 0 ? 'По выбранным параметрам ничего не найдено' : 'Пока здесь пусто'}</strong>
          <p>
            {categoryPlaces.length > 0
              ? 'Попробуй убрать часть фильтров или сменить сортировку.'
              : 'Когда владелец добавит места, они появятся здесь.'}
          </p>
        </section>
      ) : null}

      {relatedCollections.length > 0 || relatedTips.length > 0 ? (
        <section className="panel related-content-panel">
          <div className="section-headline">
            <strong>Полезное в этом разделе</strong>
          </div>
          <div className="related-content-grid">
            {relatedCollections.map((collection) => (
              <Link key={collection.id} to={collection.linkPath} className="related-content-card">
                <strong>{collection.title}</strong>
                <span>{collection.description}</span>
              </Link>
            ))}
            {relatedTips.map((tip) => (
              <Link key={tip.id} to={tip.linkPath} className="related-content-card related-content-card--tip">
                <strong>{tip.title}</strong>
                <span>{tip.text}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
