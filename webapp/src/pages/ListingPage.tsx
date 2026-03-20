import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { ListingCard } from '../components/listing/ListingCard';
import { PageHeader } from '../components/layout/PageHeader';
import { accentClassMap } from '../data/categories';
import { useFavorites } from '../hooks/useFavorites';
import type { Category, FilterConfig, Listing } from '../types';

type ListingPageProps = {
  categorySlug?: string;
};

type FilterState = Record<string, string | string[] | boolean>;

function getFieldValue(listing: Listing, field: string): unknown {
  return field.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, listing as unknown as Record<string, unknown>);
}

function matchesFilter(listing: Listing, filter: FilterConfig, value: string | string[] | boolean) {
  if (filter.type === 'boolean') {
    return value ? Boolean(getFieldValue(listing, filter.field)) : true;
  }

  const fieldValue = getFieldValue(listing, filter.field);

  if (filter.type === 'single') {
    if (!value) return true;
    return String(fieldValue || '') === String(value);
  }

  const listValue = Array.isArray(fieldValue) ? fieldValue.map(String) : [String(fieldValue || '')];
  const selected = Array.isArray(value) ? value : [];
  if (selected.length === 0) return true;
  return selected.every((item) => listValue.includes(item));
}

export function ListingPage({ categorySlug }: ListingPageProps) {
  const params = useParams();
  const activeSlug = categorySlug || params.slug || 'restaurants';
  const { isFavorite, toggleFavorite } = useFavorites();
  const [category, setCategory] = useState<Category | null>(null);
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<FilterState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.category(activeSlug), api.listings({ category: activeSlug })])
      .then(([categoryResponse, listingsResponse]) => {
        if (!active) return;
        setCategory(categoryResponse.category);
        setFilters(categoryResponse.filters.map((item) => item.config));
        setListings(listingsResponse.listings);
        setFilterState({});
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeSlug]);

  const visibleListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        !search.trim() ||
        [listing.title, listing.shortDescription, listing.description, listing.tags.join(' ')].join(' ').toLowerCase().includes(search.trim().toLowerCase());
      if (!matchesSearch) return false;

      return filters.every((filter) => matchesFilter(listing, filter, filterState[filter.key] || (filter.type === 'multi' ? [] : false)));
    });
  }, [listings, search, filters, filterState]);

  return (
    <div className="page-stack">
      <PageHeader
        title={category?.title || 'Категория'}
        subtitle={category?.description || 'Рабочая страница категории с фильтрами, карточками и детальными экранами.'}
        showBack
      />

      <section className="panel filter-panel-grid">
        <label className="field field--grow">
          <span>Поиск внутри раздела</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Название, тег, описание" />
        </label>

        {filters.map((filter) => (
          <div key={filter.key} className="filter-box">
            <strong>{filter.label}</strong>
            {filter.type === 'single' ? (
              <select
                value={String(filterState[filter.key] || '')}
                onChange={(event) =>
                  setFilterState((current) => ({
                    ...current,
                    [filter.key]: event.target.value
                  }))
                }
              >
                <option value="">Все</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}

            {filter.type === 'boolean' ? (
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={Boolean(filterState[filter.key])}
                  onChange={(event) =>
                    setFilterState((current) => ({
                      ...current,
                      [filter.key]: event.target.checked
                    }))
                  }
                />
                <span>{filter.trueLabel || filter.label}</span>
              </label>
            ) : null}

            {filter.type === 'multi' ? (
              <div className="chip-row">
                {filter.options?.map((option) => {
                  const currentValues = Array.isArray(filterState[filter.key])
                    ? (filterState[filter.key] as string[])
                    : [];
                  const active = currentValues.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`chip chip-button${active ? ' is-active' : ''}`}
                      onClick={() => {
                        setFilterState((state) => {
                          const selectedValues = Array.isArray(state[filter.key])
                            ? (state[filter.key] as string[])
                            : [];
                          return {
                            ...state,
                            [filter.key]: active
                              ? selectedValues.filter((item: string) => item !== option.value)
                              : [...selectedValues, option.value]
                          };
                        });
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </section>

      {loading ? <div className="panel page-loader">Загружаю карточки…</div> : null}

      <section className="listing-grid">
        {visibleListings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            accent={category?.accent}
            isFavorite={isFavorite(listing.slug)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </section>

      {!loading && visibleListings.length === 0 ? (
        <div className="panel empty-state">
          <strong>Ничего не найдено</strong>
          <p>Попробуй убрать часть фильтров или изменить поисковый запрос.</p>
        </div>
      ) : null}

      {category ? (
        <div className={`panel section-summary ${accentClassMap[category.accent] || 'is-orange'}`}>
          <strong>{category.icon} {category.shortTitle}</strong>
          <p>
            У этой категории свой набор фильтров и собственные карточки. Это уже не заглушка, а рабочая серверная страница.
          </p>
        </div>
      ) : null}
    </div>
  );
}
