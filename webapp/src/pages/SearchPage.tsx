import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ListingCard } from '../components/listing/ListingCard';
import { PageHeader } from '../components/layout/PageHeader';
import { useFavorites } from '../hooks/useFavorites';
import { useGuideContent } from '../hooks/useGuideContent';
import { usePageMeta } from '../hooks/usePageMeta';
import { sortPlacesByPriority, toListingLike } from '../utils/places';
import type { GuidePlace, GuideCategory } from '../types';

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

function createSearchText(place: GuidePlace, category?: GuideCategory) {
  return normalizeText(
    [
      place.title,
      place.description,
      place.address,
      place.kind,
      place.cuisine,
      category?.title,
      ...(place.tags || []),
      ...(place.services || [])
    ]
      .filter(Boolean)
      .join(' ')
  );
}

export function SearchPage() {
  usePageMeta({
    title: 'Поиск',
    description: 'Поиск по категориям, тегам, услугам и названиям мест в городе.'
  });
  const { isFavorite, toggleFavorite } = useFavorites();
  const { places, categories, loading, error } = useGuideContent();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const searchableListings = useMemo(
    () =>
      places.filter((place) => place.status === 'published').map((place) => ({
        ...place,
        category: categories.find((category) => category.id === place.categoryId)
      })),
    [places, categories]
  );

  const quickTags = useMemo(() => {
    const counter = new Map<string, number>();
    searchableListings.forEach(({ tags = [], services = [], cuisine, kind }) => {
      [...tags, ...services, cuisine, kind].filter(Boolean).forEach((tag) => {
        counter.set(tag, (counter.get(tag) || 0) + 1);
      });
    });

    return [...counter.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [searchableListings]);

  const normalizedQuery = normalizeText(query.trim());

  const results = useMemo(() => {
    return sortPlacesByPriority(
      searchableListings.filter(({ category, ...place }) => {
        if (categoryFilter !== 'all' && place.categoryId !== categoryFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return createSearchText(place, category).includes(normalizedQuery);
      })
    );
  }, [searchableListings, categoryFilter, normalizedQuery]);

  const hasQuery = normalizedQuery.length > 0 || categoryFilter !== 'all';

  return (
    <div className="page-stack reference-page reference-page--search">
      <PageHeader title="Search" subtitle="Find places, food, routes and tips" showBack />

      <section className="reference-search-panel panel">
        <div className="reference-search-panel__row reference-search-panel__row--input">
          <label className="reference-search-input">
            <span className="reference-search-input__icon" aria-hidden="true">
              ⌕
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for places…"
            />
          </label>

          <label className="reference-select-field">
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All categories</option>
              {categories
                .filter((category) => category.visible)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <div className="reference-search-panel__row reference-search-panel__row--chips">
          {quickTags.map((tag) => (
            <button key={tag} type="button" className="reference-chip" onClick={() => setQuery(tag)}>
              {tag}
            </button>
          ))}
        </div>

        <div className="reference-search-panel__row reference-search-panel__row--actions">
          <strong>{hasQuery ? `${results.length} results` : `${searchableListings.length} places`}</strong>
          <div className="reference-inline-actions">
            <Link className="reference-link-pill" to="/nearby">
              Map view
            </Link>
            {(query || categoryFilter !== 'all') ? (
              <button
                className="reference-link-pill reference-link-pill--ghost"
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategoryFilter('all');
                }}
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {loading ? <div className="panel page-loader">Обновляю базу мест…</div> : null}
      {error ? (
        <div className="panel empty-state empty-state--left">
          <strong>Не удалось загрузить поиск</strong>
          <p>{error}</p>
        </div>
      ) : null}

      {!loading && results.length > 0 ? (
        <section className="listing-grid listing-grid--travel-list">
          {results.map(({ category, ...listing }) => (
            <ListingCard
              key={listing.id}
              listing={toListingLike(listing)}
              accent={category?.accent}
              isFavorite={isFavorite(toListingLike(listing).slug)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </section>
      ) : null}

      {!loading && results.length === 0 ? (
        <div className="panel empty-state">
          <strong>{hasQuery ? 'Совпадений не нашли' : 'Начни с подсказки или запроса'}</strong>
          <p>
            {hasQuery
              ? 'Попробуй убрать часть запроса, сменить категорию или выбрать одну из популярных подсказок выше.'
              : 'Поиск работает по названиям, описаниям, тегам, услугам и кухням.'}
          </p>
        </div>
      ) : null}
    </div>
  );
}
