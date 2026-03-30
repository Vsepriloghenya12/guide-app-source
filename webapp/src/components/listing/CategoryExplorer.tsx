import { useEffect, useMemo, useState } from 'react';
import { FilterPanel } from '../common/FilterPanel';
import { PageHeader } from '../layout/PageHeader';
import { ListingCard } from './ListingCard';
import { defaultCategories } from '../../data/categories';
import { useFavorites } from '../../hooks/useFavorites';
import { useGuideContent } from '../../hooks/useGuideContent';
import { usePageMeta } from '../../hooks/usePageMeta';
import { comparePlacesByPriority, toListingLike } from '../../utils/places';
import type { GuideCategory, GuideCategoryId, GuidePlace } from '../../types';

type CategoryExplorerProps = {
  categoryId?: GuideCategoryId;
  categorySlug?: string;
};

type SortMode = 'priority' | 'rating' | 'alphabet' | 'check-low' | 'check-high';
type BinaryFilter = 'all' | 'yes' | 'no';

type FiltersState = {
  breakfast: BinaryFilter;
  vegan: BinaryFilter;
  kind: string;
  cuisine: string;
  district: string;
  minCheck: string;
  maxCheck: string;
  hotelStars: string;
  hotelPool: BinaryFilter;
  hotelSpa: BinaryFilter;
  petFriendly: BinaryFilter;
  selectedServices: string[];
  selectedTags: string[];
  selectedQuickTokens: string[];
  sortMode: SortMode;
};

const initialFilters: FiltersState = {
  breakfast: 'all',
  vegan: 'all',
  kind: 'all',
  cuisine: 'all',
  district: 'all',
  minCheck: '',
  maxCheck: '',
  hotelStars: 'all',
  hotelPool: 'all',
  hotelSpa: 'all',
  petFriendly: 'all',
  selectedServices: [],
  selectedTags: [],
  selectedQuickTokens: [],
  sortMode: 'priority'
};

const restaurantQuickFilters = ['Морепродукты', 'Вьетнамская', 'Европейская'];

function toLabel(filterKey: string) {
  const map: Record<string, string> = {
    avgCheck: 'Средний чек',
    kind: 'Тип',
    cuisine: 'Кухня',
    services: 'Услуги',
    tags: 'Теги',
    district: 'Район',
    hotelStars: 'Звёзды',
    hotelPool: 'Бассейн',
    hotelSpa: 'СПА',
    petFriendly: 'С животными'
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

function matchesBinaryFilter(value: boolean, filter: BinaryFilter) {
  if (filter === 'all') return true;
  return filter === 'yes' ? value : !value;
}

function normalizeToken(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

function matchesQuickToken(place: GuidePlace, token: string) {
  const normalized = normalizeToken(token);

  if (!normalized) {
    return true;
  }

  if (normalized === 'breakfast') {
    return Boolean(place.breakfast) || place.tags?.some((tag) => normalizeToken(tag) === normalized) || place.services?.some((service) => normalizeToken(service) === normalized);
  }

  if (normalized === 'vegan') {
    return Boolean(place.vegan) || place.tags?.some((tag) => normalizeToken(tag) === normalized) || place.services?.some((service) => normalizeToken(service) === normalized);
  }

  if (normalized === 'pets') {
    return Boolean(place.petFriendly ?? place.pets);
  }

  if (normalized === 'childprograms') {
    return Boolean(place.childPrograms ?? place.childFriendly);
  }

  const haystack = [
    place.title,
    place.description,
    place.shortDescription,
    place.address,
    place.kind,
    place.cuisine,
    place.district,
    place.hours,
    place.priceLabel,
    ...(place.services || []),
    ...(place.tags || [])
  ]
    .filter(Boolean)
    .map((value) => normalizeToken(String(value)));

  return haystack.some((value) => value.includes(normalized));
}

export function CategoryExplorer({ categoryId, categorySlug }: CategoryExplorerProps) {
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [isRestaurantFilterOpen, setRestaurantFilterOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { categories, places, loading, error } = useGuideContent();

  useEffect(() => {
    if (!isRestaurantFilterOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setRestaurantFilterOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isRestaurantFilterOpen]);

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
  const hotelStarsOptions = useMemo(
    () =>
      Array.from(
        new Set(categoryPlaces.map((item) => item.hotelStars).filter((value): value is number => typeof value === 'number' && Number.isFinite(value)))
      ).sort((a, b) => b - a),
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

  const visibleQuickFilters = useMemo(() => {
    const configured = category?.filterSchema?.quickFilters || [];
    return configured.filter((token) => categoryPlaces.some((place) => matchesQuickToken(place, token)));
  }, [category?.filterSchema?.quickFilters, categoryPlaces]);

  const filteredPlaces = useMemo(() => {
    const nextPlaces = categoryPlaces.filter((place) => {
      if (!matchesBinaryFilter(Boolean(place.breakfast), filters.breakfast)) {
        return false;
      }

      if (!matchesBinaryFilter(Boolean(place.vegan), filters.vegan)) {
        return false;
      }

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

      if (filters.hotelStars !== 'all' && Number(place.hotelStars || 0) !== Number(filters.hotelStars)) {
        return false;
      }

      if (!matchesBinaryFilter(Boolean(place.hotelPool), filters.hotelPool)) {
        return false;
      }

      if (!matchesBinaryFilter(Boolean(place.hotelSpa), filters.hotelSpa)) {
        return false;
      }

      if (!matchesBinaryFilter(Boolean(place.petFriendly ?? place.pets), filters.petFriendly)) {
        return false;
      }

      if (filters.selectedServices.length > 0 && !filters.selectedServices.every((service) => place.services?.includes(service))) {
        return false;
      }

      if (filters.selectedTags.length > 0 && !filters.selectedTags.every((tag) => place.tags?.includes(tag))) {
        return false;
      }

      if (filters.selectedQuickTokens.length > 0 && !filters.selectedQuickTokens.every((token) => matchesQuickToken(place, token))) {
        return false;
      }

      return true;
    });

    return sortPlaces(nextPlaces, filters.sortMode);
  }, [categoryPlaces, filters]);

  const activeFiltersCount =
    filters.selectedServices.length +
    filters.selectedTags.length +
    filters.selectedQuickTokens.length +
    Number(filters.breakfast !== 'all') +
    Number(filters.vegan !== 'all') +
    Number(filters.kind !== 'all') +
    Number(filters.cuisine !== 'all') +
    Number(filters.district !== 'all') +
    Number(Boolean(filters.minCheck)) +
    Number(Boolean(filters.maxCheck)) +
    Number(filters.hotelStars !== 'all') +
    Number(filters.hotelPool !== 'all') +
    Number(filters.hotelSpa !== 'all') +
    Number(filters.petFriendly !== 'all');

  if (!category) {
    return (
      <div className="page-stack">
        <PageHeader title="Раздел не найден" subtitle="Возможно, категория скрыта или ещё не создана." showBack />
      </div>
    );
  }

  if (category.id === 'restaurants') {
    const restaurantHeroImage = category.imageSrc || '/home-hero-background.png';

    return (
      <div className="page-stack category-explorer-page category-explorer-page--restaurants">
        <section className="restaurant-category-hero" style={{ backgroundImage: `url(${restaurantHeroImage})` }}>
          <div className="restaurant-category-hero__overlay" />
          <div className="restaurant-category-hero__content">
            <h1>{category.shortTitle || 'Рестораны'}</h1>
          </div>
        </section>

        <section className="restaurant-filters-shell">
          <div className="restaurant-filters-row" role="toolbar" aria-label="Быстрые фильтры ресторанов">
            {restaurantQuickFilters.map((token) => (
              <button
                key={token}
                type="button"
                className={`restaurant-quick-filter ${filters.selectedQuickTokens.includes(token) ? 'is-active' : ''}`}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    selectedQuickTokens: current.selectedQuickTokens.includes(token) ? [] : [token]
                  }))
                }
              >
                {token}
              </button>
            ))}

            <button className="restaurant-filter-button" type="button" onClick={() => setRestaurantFilterOpen(true)} aria-label="Фильтры">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 7h16M7 12h10m-7 5h4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </section>

        {isRestaurantFilterOpen ? (
          <div className="modal-backdrop" role="presentation" onClick={() => setRestaurantFilterOpen(false)}>
            <section
              className="modal-window filter-modal restaurant-filter-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Фильтры ресторанов"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-window__header">
                <div>
                  <strong>Фильтры ресторанов</strong>
                </div>
                <button className="modal-window__close" type="button" onClick={() => setRestaurantFilterOpen(false)}>
                  ✕
                </button>
              </div>

              <div className="modal-window__body">
                <div className="filter-stack restaurant-filter-stack">
                  <label className="field field--grow">
                    <span>Кухня</span>
                    <select value={filters.cuisine} onChange={(event) => setFilters((current) => ({ ...current, cuisine: event.target.value }))}>
                      <option value="all">Все</option>
                      {cuisineOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field field--grow">
                    <span>Завтраки</span>
                    <select value={filters.breakfast} onChange={(event) => setFilters((current) => ({ ...current, breakfast: event.target.value as BinaryFilter }))}>
                      <option value="all">Не важно</option>
                      <option value="yes">Да</option>
                      <option value="no">Нет</option>
                    </select>
                  </label>

                  <label className="field field--grow">
                    <span>Веганское меню</span>
                    <select value={filters.vegan} onChange={(event) => setFilters((current) => ({ ...current, vegan: event.target.value as BinaryFilter }))}>
                      <option value="all">Не важно</option>
                      <option value="yes">Да</option>
                      <option value="no">Нет</option>
                    </select>
                  </label>

                  <label className="field field--grow">
                    <span>Можно с животными</span>
                    <select value={filters.petFriendly} onChange={(event) => setFilters((current) => ({ ...current, petFriendly: event.target.value as BinaryFilter }))}>
                      <option value="all">Не важно</option>
                      <option value="yes">Да</option>
                      <option value="no">Нет</option>
                    </select>
                  </label>

                  <div className="filter-grid-two">
                    <label className="field field--grow">
                      <span>Средний чек от</span>
                      <input value={filters.minCheck} onChange={(event) => setFilters((current) => ({ ...current, minCheck: event.target.value }))} inputMode="numeric" placeholder="от" />
                    </label>
                    <label className="field field--grow">
                      <span>Средний чек до</span>
                      <input value={filters.maxCheck} onChange={(event) => setFilters((current) => ({ ...current, maxCheck: event.target.value }))} inputMode="numeric" placeholder="до" />
                    </label>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}

        {loading ? <div className="travel-state-card">Загружаю рестораны…</div> : null}
        {error ? (
          <div className="travel-state-card">
            <strong>Не удалось обновить список</strong>
            <p>{error}</p>
          </div>
        ) : null}

        {!loading && filteredPlaces.length > 0 ? (
          <section className="restaurant-list">
            {filteredPlaces.map((item) => {
              const listing = toListingLike(item);
              return <ListingCard key={item.id} listing={listing} accent={category.accent} variant="restaurant" />;
            })}
          </section>
        ) : null}

        {!loading && filteredPlaces.length === 0 ? (
          <section className="travel-state-card">
            <strong>{categoryPlaces.length > 0 ? 'По выбранным параметрам ничего не найдено' : 'Пока здесь пусто'}</strong>
            <p>
              {categoryPlaces.length > 0
                ? 'Попробуй убрать часть фильтров или изменить выбранные параметры.'
                : 'Когда владелец добавит рестораны, они появятся здесь.'}
            </p>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className="page-stack category-explorer-page category-explorer-page--minimal">
      <PageHeader title={category.title} subtitle={undefined} showBack />

      <FilterPanel
        title={`Фильтр · ${category.shortTitle}`}
        triggerLabel="Открыть фильтр"
        activeCount={activeFiltersCount}
        summary={`${filteredPlaces.length} мест${activeFiltersCount > 0 ? ` · активных фильтров ${activeFiltersCount}` : ''}`}
        quickActions={
          visibleQuickFilters.length > 0 ? (
            <div className="chip-row chip-row--wrap">
              {visibleQuickFilters.map((token) => (
                <button
                  key={token}
                  type="button"
                  className={`chip chip--action ${filters.selectedQuickTokens.includes(token) ? 'is-active' : ''}`}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      selectedQuickTokens: toggleInArray(current.selectedQuickTokens, token)
                    }))
                  }
                >
                  {token}
                </button>
              ))}
            </div>
          ) : null
        }
        onReset={() => setFilters(initialFilters)}
      >
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

          {filterFields.includes('hotelStars') ? (
            <label className="field field--grow">
              <span>{toLabel('hotelStars')}</span>
              <select value={filters.hotelStars} onChange={(event) => setFilters((current) => ({ ...current, hotelStars: event.target.value }))}>
                <option value="all">Любое количество</option>
                {hotelStarsOptions.map((option) => (
                  <option key={option} value={String(option)}>
                    {option}★
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {filterFields.includes('hotelPool') ? (
            <label className="field field--grow">
              <span>{toLabel('hotelPool')}</span>
              <select value={filters.hotelPool} onChange={(event) => setFilters((current) => ({ ...current, hotelPool: event.target.value as BinaryFilter }))}>
                <option value="all">Неважно</option>
                <option value="yes">Да</option>
                <option value="no">Нет</option>
              </select>
            </label>
          ) : null}

          {filterFields.includes('hotelSpa') ? (
            <label className="field field--grow">
              <span>{toLabel('hotelSpa')}</span>
              <select value={filters.hotelSpa} onChange={(event) => setFilters((current) => ({ ...current, hotelSpa: event.target.value as BinaryFilter }))}>
                <option value="all">Неважно</option>
                <option value="yes">Да</option>
                <option value="no">Нет</option>
              </select>
            </label>
          ) : null}

          {filterFields.includes('petFriendly') ? (
            <label className="field field--grow">
              <span>{toLabel('petFriendly')}</span>
              <select value={filters.petFriendly} onChange={(event) => setFilters((current) => ({ ...current, petFriendly: event.target.value as BinaryFilter }))}>
                <option value="all">Неважно</option>
                <option value="yes">Да</option>
                <option value="no">Нет</option>
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

          <label className="field field--grow">
            <span>Сортировка</span>
            <select value={filters.sortMode} onChange={(event) => setFilters((current) => ({ ...current, sortMode: event.target.value as SortMode }))}>
              <option value="priority">По приоритету</option>
              <option value="rating">По рейтингу</option>
              <option value="alphabet">По алфавиту</option>
              <option value="check-low">Сначала дешевле</option>
              <option value="check-high">Сначала дороже</option>
            </select>
          </label>
        </div>
      </FilterPanel>

      {loading ? <div className="panel page-loader">Загружаю карточки раздела…</div> : null}
      {error ? (
        <div className="panel empty-state empty-state--left">
          <strong>Не удалось обновить раздел</strong>
          <p>{error}</p>
        </div>
      ) : null}

      {!loading && filteredPlaces.length > 0 ? (
        <section className="listing-grid">
          {filteredPlaces.map((item) => {
            const listing = toListingLike(item);
            return (
              <ListingCard
                key={item.id}
                listing={listing}
                accent={category.accent}
                isFavorite={isFavorite(listing.slug)}
                onToggleFavorite={toggleFavorite}
              />
            );
          })}
        </section>
      ) : null}

      {!loading && filteredPlaces.length === 0 ? (
        <section className="panel empty-state empty-state--left">
          <strong>{categoryPlaces.length > 0 ? 'По выбранным параметрам ничего не найдено' : 'Пока здесь пусто'}</strong>
          <p>
            {categoryPlaces.length > 0
              ? 'Попробуй убрать часть фильтров или сбросить выбранные параметры.'
              : 'Когда владелец добавит места, они появятся здесь.'}
          </p>
        </section>
      ) : null}
    </div>
  );
}
