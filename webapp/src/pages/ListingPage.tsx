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


type ListingPageProps = {
  category: 'restaurants' | 'wellness';
};

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

function sortListings<T extends { featured: boolean; sortOrder: number; rating: number; title: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    if (left.rating !== right.rating) {
      return right.rating - left.rating;
    }
    return left.title.localeCompare(right.title, 'ru');
  });
}

export function ListingPage({ category }: ListingPageProps) {
  const [restaurantFilters, setRestaurantFilters] = useState<RestaurantFiltersState>(
    initialRestaurantFilters
  );
  const [wellnessFiltersState, setWellnessFiltersState] =
    useState<WellnessFiltersState>(initialWellnessFilters);
  const { restaurants, wellness, isLoading } = useGuideContent();

  const publicRestaurants = useMemo(
    () => restaurants.filter((item) => item.status === 'published'),
    [restaurants]
  );

  const publicWellness = useMemo(
    () => wellness.filter((item) => item.status === 'published'),
    [wellness]
  );

  const filteredRestaurants = useMemo(() => {
    const filtered = publicRestaurants.filter((item) => {
      const minCheck = Number(restaurantFilters.minCheck || 0);
      const maxCheck = Number(restaurantFilters.maxCheck || 0);

      if (restaurantFilters.kind !== 'all' && item.kind !== restaurantFilters.kind) {
        return false;
      }

      if (restaurantFilters.cuisine !== 'all' && item.cuisine !== restaurantFilters.cuisine) {
        return false;
      }

      if (restaurantFilters.breakfast !== 'all') {
        const shouldHaveBreakfast = restaurantFilters.breakfast === 'yes';
        if (item.breakfast !== shouldHaveBreakfast) {
          return false;
        }
      }

      if (restaurantFilters.vegan !== 'all') {
        const shouldHaveVegan = restaurantFilters.vegan === 'yes';
        if (item.vegan !== shouldHaveVegan) {
          return false;
        }
      }

      if (restaurantFilters.pets !== 'all') {
        const shouldAllowPets = restaurantFilters.pets === 'yes';
        if (item.pets !== shouldAllowPets) {
          return false;
        }
      }

      if (minCheck > 0 && item.avgCheck < minCheck) {
        return false;
      }

      if (maxCheck > 0 && item.avgCheck > maxCheck) {
        return false;
      }

      return true;
    });

    return sortListings(filtered);
  }, [restaurantFilters, publicRestaurants]);

  const filteredWellness = useMemo(() => {
    const filtered = publicWellness.filter((item) => {
      if (
        wellnessFiltersState.service.length > 0 &&
        !wellnessFiltersState.service.some((service) => item.services.includes(service as never))
      ) {
        return false;
      }

      if (wellnessFiltersState.childPrograms !== 'all') {
        const shouldHavePrograms = wellnessFiltersState.childPrograms === 'yes';
        if (item.childPrograms !== shouldHavePrograms) {
          return false;
        }
      }

      return true;
    });

    return sortListings(filtered);
  }, [wellnessFiltersState, publicWellness]);

  if (category === 'restaurants') {
    return (
      <div className="page-stack">
        <PageHeader
          title="Рестораны, кафе и столовые"
          subtitle="Раздел подключён к owner-CMS и серверному хранилищу: на витрину попадают только опубликованные карточки, а сортировка и топ-показ управляются владельцем."
          showBack
        />

        <FilterPanel title="Фильтр ресторанов">
          <RestaurantFilters value={restaurantFilters} onChange={setRestaurantFilters} />
        </FilterPanel>

        {isLoading ? <p className="loading-inline">Загружаем карточки…</p> : null}

        <section className="grid-listing">
          {filteredRestaurants.map((item) => (
            <PlaceholderCard
              key={item.id}
              title={item.title}
              address={item.address}
              description={item.description}
              rating={item.rating}
              imageLabel={item.imageLabel}
              meta={[
                item.featured ? 'Топ-показ' : 'Стандартный показ',
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
                item.hours || 'Часы работы не указаны',
                item.breakfast ? 'Есть завтраки' : 'Без завтраков',
                item.vegan ? 'Веган меню' : 'Без веган меню',
                item.pets ? 'Можно с животными' : 'Без животных',
                ...item.tags.map((tag) => `#${tag}`)
              ]}
            />
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="СПА и оздоровление"
        subtitle="Этот раздел тоже связан с owner-CMS: на витрину попадают только опубликованные карточки, а порядок показа и блок «топ» управляются владельцем."
        showBack
      />

      <FilterPanel title="Фильтр СПА и оздоровления">
        <WellnessFilters value={wellnessFiltersState} onChange={setWellnessFiltersState} />
      </FilterPanel>

      {isLoading ? <p className="loading-inline">Загружаем карточки…</p> : null}

      <section className="grid-listing">
        {filteredWellness.map((item) => (
          <PlaceholderCard
            key={item.id}
            title={item.title}
            address={item.address}
            description={item.description}
            rating={item.rating}
            imageLabel={item.imageLabel}
            meta={[
              item.featured ? 'Топ-показ' : 'Стандартный показ',
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
              item.hours || 'Часы работы не указаны',
              item.childPrograms ? 'Есть детские программы' : 'Без детских программ',
              ...item.tags.map((tag) => `#${tag}`)
            ]}
          />
        ))}
      </section>
    </div>
  );
}
