import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ListingCard } from '../components/listing/ListingCard';
import { PageHeader } from '../components/layout/PageHeader';
import { useFavorites } from '../hooks/useFavorites';
import type { Listing } from '../types';

export function SearchPage() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      api
        .search(query)
        .then((response) => setResults(response.listings))
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className="page-stack">
      <PageHeader title="Глобальный поиск" subtitle="Поиск теперь работает по всем опубликованным карточкам, названиям и тегам." showBack />
      <section className="panel">
        <label className="field field--grow">
          <span>Что ищем</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например: spa, breakfast, market" />
        </label>
      </section>

      {loading ? <div className="panel page-loader">Ищу по всем категориям…</div> : null}

      <section className="listing-grid">
        {results.map((listing) => (
          <ListingCard key={listing.id} listing={listing} isFavorite={isFavorite(listing.slug)} onToggleFavorite={toggleFavorite} />
        ))}
      </section>

      {!loading && results.length === 0 ? (
        <div className="panel empty-state">
          <strong>Пока пусто</strong>
          <p>Введите запрос — поиск пройдёт по всем опубликованным карточкам и тегам.</p>
        </div>
      ) : null}
    </div>
  );
}
