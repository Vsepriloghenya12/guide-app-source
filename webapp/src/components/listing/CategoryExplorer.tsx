import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterPanel } from '../common/FilterPanel';
import { PlaceholderCard } from '../common/PlaceholderCard';
import { PageHeader } from '../layout/PageHeader';
import { defaultCategories } from '../../data/categories';
import { useGuideContent } from '../../hooks/useGuideContent';
import { useUserLocation } from '../../hooks/useUserLocation';
import { usePageMeta } from '../../hooks/usePageMeta';
import {
  comparePlacesByPriority,
  createGoogleDirectionsUrl,
  estimateTravelTime,
  formatDistance,
  hasCoordinates,
  haversineDistanceKm,
  toListingLike
} from '../../utils/places';
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
  quickFilters: string[];
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
  quickFilters: [],
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

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function toLabel(filterKey: string) {
  const map: Record<string, string> = {
    breakfast: 'Завтраки',
    vegan: 'Веган-опции',
    pets: 'Можно с животными',
    childPrograms: 'Есть детские программы',
    top: 'Топ места',
    avgCheck: 'Средний чек',
    kind: 'Тип',
    cuisine: 'Кухня',
    services: 'Услуги',
    tags: 'Теги',
    district: 'Район'
  };

  return map[filterKey] || filterKey;
}

function formatQuickFilterLabel(filterKey: string) {
  return toLabel(filterKey);
}

function matchQuickFilter(place: GuidePlace, filterKey: string) {
  switch (filterKey) {
    case 'breakfast':
      return place.breakfast;
    case 'vegan':
      return place.vegan;
    case 'pets':
      return place.pets;
    case 'childPrograms':
      return place.childPrograms;
    case 'top':
      return place.top;
    default: {
      const normalized = normalizeText(filterKey);
      const haystack = [
        place.kind,
        place.cuisine,
        ...(place.tags || []),
        ...(place.services || [])
      ]
        .filter(Boolean)
        .map((value) => normalizeText(String(value)));
      return haystack.some((value) => value.includes(normalized));
    }
  }
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

function hasMeaningfulCoords(place: GuidePlace) {
  return typeof place.lat === 'number' && typeof place.lng === 'number';
}

function isNonEmptyString(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getGuideContext(categoryId: GuideCategoryId) {
  const map: Record<GuideCategoryId, { title: string; description: string; primaryLabel: string; primaryPath: string; secondaryLabel: string; secondaryPath: string }> = {
    restaurants: {
      title: 'Быстрый вход в гастрогид',
      description: 'Собирай nearby-выдачу, сохраняй места в избранное и открывай маршрут прямо из карточек.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Поиск по всем местам',
      secondaryPath: '/search'
    },
    wellness: {
      title: 'Рядом и восстановиться',
      description: 'У СПА и wellness удобнее всего работает nearby-сценарий: можно быстро выбрать место рядом и сразу построить маршрут.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Поиск по всем местам',
      secondaryPath: '/search'
    },
    'active-rest': {
      title: 'Ближайшие активности',
      description: 'Для active rest уже подготовлен сценарий выбора nearby и открытия маршрута в карты.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Поиск по всем местам',
      secondaryPath: '/search'
    },
    routes: {
      title: 'Маршруты и точки старта',
      description: 'Этот раздел уже можно использовать как мини-гид: выбери маршрут, посмотри ближайшие точки и открой навигацию от текущего местоположения.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Все места на карте',
      secondaryPath: '/search'
    },
    hotels: {
      title: 'Отели вокруг тебя',
      description: 'Когда owner заполнит координаты, nearby будет показывать ближайшие варианты проживания и быстрые переходы в карты.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Поиск по всем местам',
      secondaryPath: '/search'
    },
    events: {
      title: 'События поблизости',
      description: 'Афишный модуль ещё впереди, но nearby и маршруты уже готовы под события и локации.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Поиск по всем местам',
      secondaryPath: '/search'
    },
    transport: {
      title: 'Транспорт рядом',
      description: 'Подходит для трансферов, шаттлов и точек старта. Можно быстро найти ближайший сервис и открыть маршрут в карты.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Открыть банкоматы',
      secondaryPath: '/section/atm'
    },
    atm: {
      title: 'Банкоматы и банки рядом',
      description: 'Этот раздел уже может работать как util-блок: найди ближайшую точку, оцени расстояние и сразу открой маршрут.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Открыть транспорт',
      secondaryPath: '/section/transport'
    },
    shops: {
      title: 'Шопинг-подсказки',
      description: 'Когда owner добавит координаты, раздел сможет показывать магазины и сувениры рядом с пользователем.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Поиск по всем местам',
      secondaryPath: '/search'
    },
    culture: {
      title: 'Культура рядом',
      description: 'Достопримечательности особенно удобно смотреть через nearby и быстрые карты-ссылки.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Открыть фото-споты',
      secondaryPath: '/section/photo-spots'
    },
    kids: {
      title: 'Семейные места рядом',
      description: 'Nearby и быстрые маршруты уже подходят для семейного раздела и удобны в поездке.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Поиск по всем местам',
      secondaryPath: '/search'
    },
    medicine: {
      title: 'Полезные точки рядом',
      description: 'Клиники и аптеки — как раз тот сценарий, где nearby и маршрут особенно важны.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Поиск по всем местам',
      secondaryPath: '/search'
    },
    'photo-spots': {
      title: 'Фото-споты вокруг тебя',
      description: 'Раздел уже умеет работать как карта вдохновения: можно быстро посмотреть ближайшие точки и сразу уехать на место.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Открыть маршруты',
      secondaryPath: '/section/routes'
    },
    'car-rental': {
      title: 'Транспорт и аренда',
      description: 'Автопрокат логично связать с nearby и маршрутами: сначала находишь точку, потом строишь маршрут.',
      primaryLabel: 'Открыть nearby',
      primaryPath: '/nearby',
      secondaryLabel: 'Открыть транспорт',
      secondaryPath: '/section/transport'
    }
  };

  return map[categoryId];
}

export function CategoryExplorer({ categoryId, categorySlug }: CategoryExplorerProps) {
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const { categories, places, tips, collections, loading, error } = useGuideContent();
  const { location: userLocation, requestLocation, state: geoState } = useUserLocation();

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
    description: category?.description || 'Категория guide с фильтрами, карточками мест и быстрыми переходами по разделу.'
  });

  const categoryPlaces = useMemo(() => {
    if (!category) {
      return [];
    }

    return places.filter((place) => place.categoryId === category.id && place.status === 'published');
  }, [places, category]);

  const filterFields = category?.filterSchema?.fields || [];
  const quickFilters = category?.filterSchema?.quickFilters || [];

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

      if (filters.quickFilters.length > 0 && !filters.quickFilters.every((filterKey) => matchQuickFilter(place, filterKey))) {
        return false;
      }

      return true;
    });

    return sortPlaces(nextPlaces, filters.sortMode);
  }, [categoryPlaces, filters]);

  const withCoordsCount = useMemo(() => categoryPlaces.filter(hasMeaningfulCoords).length, [categoryPlaces]);
  const topCount = useMemo(() => categoryPlaces.filter((place) => place.top).length, [categoryPlaces]);
  const activeQuickFiltersCount = filters.quickFilters.length + filters.selectedServices.length + filters.selectedTags.length + Number(filters.kind !== 'all') + Number(filters.cuisine !== 'all') + Number(filters.district !== 'all') + Number(Boolean(filters.minCheck)) + Number(Boolean(filters.maxCheck));

  const geoReadyPlaces = useMemo(() => {
    if (!userLocation) {
      return [] as Array<GuidePlace & { distanceKm: number }>;
    }

    return sortPlaces(
      categoryPlaces
        .filter(hasMeaningfulCoords)
        .map((place) => ({
          ...place,
          distanceKm: haversineDistanceKm(userLocation, { lat: place.lat!, lng: place.lng! })
        })),
      'priority'
    )
      .sort((left, right) => left.distanceKm - right.distanceKm)
      .slice(0, 3);
  }, [categoryPlaces, userLocation]);

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

  const guideContext = getGuideContext(category.id);
  const eventHighlights = category.id === 'events' ? sortPlaces(categoryPlaces, 'priority').slice(0, 3) : [];

  return (
    <div className="page-stack category-explorer-page">
      <PageHeader
        title={category.title}
        subtitle={category.description || 'Раздел наполнен карточками, фильтрами и быстрыми переходами.'}
        showBack
        badgeLabel={category.shortTitle}
      />

      <section className={`panel category-hero category-hero--${category.accent || 'coast'}`}>
        <div className="category-hero__content">
          <div className="chip-row chip-row--wrap">
            <span className="chip">{category.shortTitle}</span>
            {category.badge ? <span className="chip chip--soft">{category.badge}</span> : null}
            <span className="chip chip--soft">{categoryPlaces.length} мест</span>
            {topCount > 0 ? <span className="chip chip--soft">{topCount} в топе</span> : null}
            {withCoordsCount > 0 ? <span className="chip chip--soft">{withCoordsCount} с координатами</span> : null}
          </div>
          <h2>{category.title}</h2>
          <p>
            {categoryPlaces.length > 0
              ? 'Раздел уже можно использовать как полноценную витрину: фильтруй, сортируй, открывай карточки мест и строй маршрут.'
              : 'Раздел уже готов по структуре. Как только владелец добавит карточки, здесь сразу появятся фильтры, сетка мест и детальные страницы.'}
          </p>
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
            <strong>Скоро в афише</strong>
            <span>Быстрый вход в ближайшие и самые заметные события.</span>
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

      {guideContext ? (
        <section className="panel guide-tools-panel">
          <div className="section-headline section-headline--muted">
            <strong>{guideContext.title}</strong>
            <span>Guide tools</span>
          </div>
          <p>{guideContext.description}</p>
          <div className="guide-tools-panel__actions">
            <Link className="button button--primary" to={guideContext.primaryPath}>{guideContext.primaryLabel}</Link>
            <Link className="button button--ghost" to={guideContext.secondaryPath}>{guideContext.secondaryLabel}</Link>
            {!userLocation ? (
              <button className="button button--ghost" type="button" onClick={requestLocation} disabled={geoState === 'loading'}>
                {geoState === 'loading' ? 'Определяю…' : 'Включить геолокацию'}
              </button>
            ) : null}
          </div>

          {geoReadyPlaces.length > 0 ? (
            <div className="guide-nearest-grid">
              {geoReadyPlaces.map((place) => (
                <a
                  key={`near-${place.id}`}
                  className="guide-nearest-card"
                  href={createGoogleDirectionsUrl(toListingLike(place), userLocation)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <strong>{place.title}</strong>
                  <span>{formatDistance(place.distanceKm)}</span>
                  <small>{estimateTravelTime(place.distanceKm, 'drive')} на машине</small>
                </a>
              ))}
            </div>
          ) : (
            <div className="guide-tools-panel__hint">
              <strong>{withCoordsCount > 0 ? 'Включи геолокацию, чтобы увидеть ближайшие точки.' : 'Когда у карточек появятся координаты, здесь будет блок ближайших точек.'}</strong>
              <span>Сейчас nearby уже готов для transport, ATM, routes и остальных guide-разделов.</span>
            </div>
          )}
        </section>
      ) : null}

      {quickFilters.length > 0 ? (
        <section className="panel quick-filter-strip">
          <div className="section-headline section-headline--muted">
            <strong>Быстрые фильтры</strong>
            {filters.quickFilters.length > 0 ? (
              <button className="button button--ghost button--small" type="button" onClick={() => setFilters((current) => ({ ...current, quickFilters: [] }))}>
                Сбросить
              </button>
            ) : null}
          </div>
          <div className="chip-row chip-row--wrap">
            {quickFilters.map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                className={`chip chip--action ${filters.quickFilters.includes(filterKey) ? 'is-active' : ''}`}
                onClick={() => setFilters((current) => ({ ...current, quickFilters: toggleInArray(current.quickFilters, filterKey) }))}
              >
                {formatQuickFilterLabel(filterKey)}
              </button>
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
          {activeQuickFiltersCount > 0 ? <span>Активно фильтров: {activeQuickFiltersCount}</span> : <span>Без активных фильтров</span>}
        </div>
        <label className="field field--compact">
          <span>Сортировка</span>
          <select value={filters.sortMode} onChange={(event) => setFilters((current) => ({ ...current, sortMode: event.target.value as SortMode }))}>
            <option value="priority">По приоритету</option>
            <option value="rating">По рейтингу</option>
            <option value="alphabet">По алфавиту</option>
            <option value="check-low">По цене: сначала дешевле</option>
            <option value="check-high">По цене: сначала дороже</option>
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
          <strong>{categoryPlaces.length > 0 ? 'По фильтрам ничего не найдено' : 'Раздел готов к наполнению'}</strong>
          <p>
            {categoryPlaces.length > 0
              ? 'Попробуй убрать часть фильтров или сменить сортировку — карточки уже есть, но они не попали под текущий набор условий.'
              : 'Когда владелец добавит первые карточки, здесь автоматически появятся места, фильтры и переходы в детальные страницы.'}
          </p>
        </section>
      ) : null}

      {relatedCollections.length > 0 || relatedTips.length > 0 ? (
        <section className="panel related-content-panel">
          <div className="section-headline">
            <strong>Полезное по разделу</strong>
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
