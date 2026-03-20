import { useMemo, useState } from 'react';
import { FilterPanel } from '../components/common/FilterPanel';
import { PlaceholderCard } from '../components/common/PlaceholderCard';
import {
  RestaurantFilters,
  RestaurantFiltersState
} from '../components/filters/RestaurantFilters';
import { WellnessFilters, WellnessFiltersState } from '../components/filters/WellnessFilters';
import { PageHeader } from '../components/layout/PageHeader';
import { useGuideContent } from '../hooks/useGuideContent';

const initialRestaurantFilters: RestaurantFiltersState = {
  kind: 'all',
  cuisine: 'all',
  breakfast: 'all',
  vegan: 'all',
  pets: 'all',
  minCheck: '',
  maxCheck: ''
};

const initialWellnessFilters: WellnessFiltersState = {
  service: [],
  childPrograms: 'all'
};

type ListingPageProps = {
  category: 'restaurants' | 'wellness';
};

export function ListingPage({ category }: ListingPageProps) {
  const [restaurantFilters, setRestaurantFilters] = useState<RestaurantFiltersState>(
    initialRestaurantFilters
  );
  const [wellnessFiltersState, setWellnessFiltersState] =
    useState<WellnessFiltersState>(initialWellnessFilters);
  const { restaurants, wellness, loading, error, reload } = useGuideContent();

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((item) => {
      const minCheck = Number(restaurantFilters.minCheck || 0);
      const maxCheck = Number(restaurantFilters.maxCheck || 0);

      if (restaurantFilters.kind !== 'all' && item.kind !== restaurantFilters.kind) return false;
      if (restaurantFilters.cuisine !== 'all' && item.cuisine !== restaurantFilters.cuisine) return false;
      if (restaurantFilters.breakfast !== 'all' && item.breakfast !== (restaurantFilters.breakfast === 'yes')) return false;
      if (restaurantFilters.vegan !== 'all' && item.vegan !== (restaurantFilters.vegan === 'yes')) return false;
      if (restaurantFilters.pets !== 'all' && item.pets !== (restaurantFilters.pets === 'yes')) return false;
      if (minCheck > 0 && item.avgCheck < minCheck) return false;
      if (maxCheck > 0 && item.avgCheck > maxCheck) return false;
      return true;
    });
  }, [restaurantFilters, restaurants]);

  const filteredWellness = useMemo(() => {
    return wellness.filter((item) => {
      if (
        wellnessFiltersState.service.length > 0 &&
        !wellnessFiltersState.service.some((service) => item.services.includes(service as never))
      ) {
        return false;
      }

      if (
        wellnessFiltersState.childPrograms !== 'all' &&
        item.childPrograms !== (wellnessFiltersState.childPrograms === 'yes')
      ) {
        return false;
      }

      return true;
    });
  }, [wellnessFiltersState, wellness]);

  return (
    <div className="page-stack">
      <PageHeader
        title={category === 'restaurants' ? 'Рестораны, кафе и столовые' : 'СПА и оздоровление'}
        subtitle={
          category === 'restaurants'
            ? 'Карточки идут из owner-CMS и сохраняются через backend. Здесь сразу виден опубликованный контент.'
            : 'Этот раздел тоже получает данные из backend и owner-CMS. Публикуются только видимые карточки.'
        }
        showBack
      />

      <FilterPanel title={category === 'restaurants' ? 'Фильтр ресторанов' : 'Фильтр СПА и оздоровления'}>
        {category === 'restaurants' ? (
          <RestaurantFilters value={restaurantFilters} onChange={setRestaurantFilters} />
        ) : (
          <WellnessFilters value={wellnessFiltersState} onChange={setWellnessFiltersState} />
        )}
      </FilterPanel>

      {loading ? (
        <section className="card card--placeholder">
          <div className="placeholder-state">
            <span className="placeholder-state__badge">Загрузка</span>
            <h2>Подгружаем карточки</h2>
            <p>Сейчас загрузим актуальные данные из приложения.</p>
          </div>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="card card--placeholder">
          <div className="placeholder-state">
            <span className="placeholder-state__badge">Ошибка</span>
            <h2>Не удалось загрузить раздел</h2>
            <p>{error}</p>
            <div className="placeholder-state__actions">
              <button className="button button--primary" type="button" onClick={() => reload()}>
                Повторить
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {!loading && !error && category === 'restaurants' ? (
        <section className="grid-listing">
          {filteredRestaurants.map((item) => (
            <PlaceholderCard
              key={item.id}
              title={item.title}
              address={item.address}
              description={item.description}
              rating={item.rating}
              imageLabel={item.imageLabel}
              imageUrl={item.imageUrl}
              meta={[
                item.kind === 'restaurant'
                  ? 'Ресторан'
                  : item.kind === 'club'
                    ? 'Клуб'
                    : item.kind === 'canteen'
                      ? 'Столовая'
                      : 'Кофейня',
                item.cuisine === 'european'
                  ? 'Европейская'
                  : item.cuisine === 'caucasian'
                    ? 'Кавказская'
                    : item.cuisine === 'thai'
                      ? 'Тайская'
                      : 'Вьетнамская',
                `Средний чек ${item.avgCheck}`,
                item.breakfast ? 'Есть завтраки' : 'Без завтраков',
                item.vegan ? 'Веган меню' : 'Без веган меню',
                item.pets ? 'Можно с животными' : 'Без животных',
                item.hours,
                item.phone
              ]}
            />
          ))}
        </section>
      ) : null}

      {!loading && !error && category === 'wellness' ? (
        <section className="grid-listing">
          {filteredWellness.map((item) => (
            <PlaceholderCard
              key={item.id}
              title={item.title}
              address={item.address}
              description={item.description}
              rating={item.rating}
              imageLabel={item.imageLabel}
              imageUrl={item.imageUrl}
              meta={[
                ...item.services.map((service) => {
                  const serviceLabelMap: Record<string, string> = {
                    massage: 'Массаж',
                    sauna: 'Баня',
                    spa: 'СПА',
                    hammam: 'Хамам',
                    cosmetology: 'Косметология',
                    wraps: 'Обертывания',
                    yoga: 'Йога'
                  };

                  return serviceLabelMap[service];
                }),
                item.childPrograms ? 'Есть детские программы' : 'Без детских программ',
                item.hours,
                item.phone
              ]}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}
