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
    title: 'Search',
    description: 'Find places, beaches, food and tips around Da Nang.'
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
    <div className="page-stack travel-page travel-page--search">
      <PageHeader title="Top Attractions" subtitle={hasQuery ? `${results.length} results` : 'Search places, food, routes and tips'} showBack />

      <section className="travel-search-panel">
        <label className="travel-search-input travel-search-input--page">
          <span className="travel-search-input__icon" aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for places..." />
        </label>

        <div className="travel-filter-row">
          <label className="travel-select">
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All categories</option>
              {categories
                .filter((category) => category.visible)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.shortTitle || category.title}
                  </option>
                ))}
            </select>
          </label>

          <Link className="travel-secondary-button" to="/nearby">
            Map View
          </Link>
        </div>

        <div className="travel-chip-row">
          {quickTags.map((tag) => (
            <button key={tag} type="button" className="travel-chip" onClick={() => setQuery(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </section>

      {loading ? <div className="travel-state-card">Updating places...</div> : null}
      {error ? <div className="travel-state-card">{error}</div> : null}

      {!loading && results.length > 0 ? (
        <section className="travel-listing-stack">
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
        <div className="travel-state-card">
          <strong>{hasQuery ? 'No matches found' : 'Start with search or quick tags'}</strong>
          <p>
            {hasQuery
              ? 'Try a shorter query, switch category or use one of the popular tags above.'
              : 'Search works by titles, tags, services, cuisine and descriptions.'}
          </p>
        </div>
      ) : null}
    </div>
  );
}
