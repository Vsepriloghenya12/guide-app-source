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
    description: 'Глобальный поиск по категориям, тегам, услугам и названиям мест внутри Danang Guide.'
  });
  const { isFavorite, toggleFavorite } = useFavorites();
  const { places, categories, loading, error } = useGuideContent();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const searchableListings = useMemo(
    () => places.filter((place) => place.status === 'published').map((place) => ({
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
    return sortPlacesByPriority(searchableListings.filter(({ category, ...place }) => {
      if (categoryFilter !== 'all' && place.categoryId !== categoryFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return createSearchText(place, category).includes(normalizedQuery);
    }));
  }, [searchableListings, categoryFilter, normalizedQuery]);

  const hasQuery = normalizedQuery.length > 0 || categoryFilter !== 'all';

  return (
    <div className="page-stack">
      <PageHeader
        title="Глобальный поиск"
        subtitle="Ищи по названиям, кухням, услугам, тегам и категориям."
        showBack
      />

      <section className="panel search-panel">
        <div className="search-panel__grid">
          <label className="field field--grow">
            <span>Что ищем</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Например: breakfast, spa, rooftop, kids"
            />
          </label>

          <label className="field field--grow">
            <span>Категория</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">Все категории</option>
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

        <div className="search-panel__chips">
          {quickTags.map((tag) => (
            <button key={tag} type="button" className="chip chip--action" onClick={() => setQuery(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </section>

      {loading ? <div className="panel page-loader">Обновляю базу мест…</div> : null}
      {error ? (
        <div className="panel empty-state empty-state--left">
          <strong>Не удалось загрузить поиск</strong>
          <p>{error}</p>
        </div>
      ) : null}

      {!loading ? (
        <div className="section-headline section-headline--muted">
          <strong>{hasQuery ? `Найдено: ${results.length}` : `Доступно мест: ${searchableListings.length}`}</strong>
          {categoryFilter !== 'all' ? <span>Фильтр по категории включён</span> : null}
        </div>
      ) : null}

      {!loading && results.length > 0 ? (
        <section className="listing-grid">
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
