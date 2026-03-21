import { useMemo, useState } from 'react';
import { FilterPanel } from '../components/common/FilterPanel';
import { PlaceholderCard } from '../components/common/PlaceholderCard';
import { RestaurantFilters, RestaurantFiltersState } from '../components/filters/RestaurantFilters';
import { WellnessFilters, WellnessFiltersState } from '../components/filters/WellnessFilters';
import { PageHeader } from '../components/layout/PageHeader';
import { useGuideContent } from '../hooks/useGuideContent';
import type { GuideCategoryId, GuidePlace } from '../types';

type ListingPageProps = {
  category: GuideCategoryId;
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

function compactStrings(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value));
}

function getPlaceImages(item: GuidePlace) {
  if (Array.isArray(item.imageGallery) && item.imageGallery.length > 0) {
    return item.imageGallery;
  }
  return item.imageSrc ? [item.imageSrc] : [];
}

export function ListingPage({ category }: ListingPageProps) {
  const [restaurantFilters, setRestaurantFilters] = useState<RestaurantFiltersState>(
    initialRestaurantFilters
  );
  const [wellnessFiltersState, setWellnessFiltersState] =
    useState<WellnessFiltersState>(initialWellnessFilters);
  const { places, categories } = useGuideContent();

  const categoryMeta = categories.find((item) => item.id === category);
  const categoryPlaces = useMemo(
    () => places.filter((place: GuidePlace) => place.categoryId === category),
    [category, places]
  );

  const restaurants = useMemo(
    () => places.filter((place: GuidePlace) => place.categoryId === 'restaurants'),
    [places]
  );
  const wellness = useMemo(
    () => places.filter((place: GuidePlace) => place.categoryId === 'wellness'),
    [places]
  );

  const restaurantKindOptions = useMemo(
    () => Array.from(new Set(restaurants.map((item: GuidePlace) => item.kind).filter(Boolean))),
    [restaurants]
  );
  const restaurantCuisineOptions = useMemo(
    () => Array.from(new Set(restaurants.map((item: GuidePlace) => item.cuisine).filter(Boolean))),
    [restaurants]
  );
  const wellnessServiceOptions = useMemo(
    () => Array.from(new Set(wellness.flatMap((item: GuidePlace) => item.services).filter(Boolean))),
    [wellness]
  );

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((item: GuidePlace) => {
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

      if (minCheck > 0 && (item.avgCheck ?? 0) < minCheck) {
        return false;
      }

      if (maxCheck > 0 && (item.avgCheck ?? 0) > maxCheck) {
        return false;
      }

      return true;
    });
  }, [restaurantFilters, restaurants]);

  const filteredWellness = useMemo(() => {
    return wellness.filter((item: GuidePlace) => {
      if (
        wellnessFiltersState.service.length > 0 &&
        !wellnessFiltersState.service.some((service) => item.services.includes(service))
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
  }, [wellnessFiltersState, wellness]);

  if (category === 'restaurants') {
    return (
      <div className="page-stack">
        <PageHeader
          title="Рестораны, кафе и столовые"
          subtitle="Раздел подключён к owner-CMS: фото, контакты, теги и фильтры обновляются сразу после сохранения."
          showBack
        />

        <FilterPanel title="Фильтр ресторанов">
          <RestaurantFilters
            value={restaurantFilters}
            onChange={setRestaurantFilters}
            kindOptions={restaurantKindOptions}
            cuisineOptions={restaurantCuisineOptions}
          />
        </FilterPanel>

        <section className="grid-listing">
          {filteredRestaurants.map((item: GuidePlace) => (
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
              analytics={{ placeId: item.id, categoryId: item.categoryId }}
              meta={compactStrings([
                item.kind,
                item.cuisine,
                item.avgCheck ? `Средний чек ${item.avgCheck}` : undefined,
                item.breakfast ? 'Есть завтраки' : undefined,
                item.vegan ? 'Веган меню' : undefined,
                item.pets ? 'Можно с животными' : undefined,
                ...item.services,
                ...item.tags
              ])}
            />
          ))}
        </section>
      </div>
    );
  }

  if (category === 'wellness') {
    return (
      <div className="page-stack">
        <PageHeader
          title="СПА и оздоровление"
          subtitle="Этот раздел тоже связан с owner-CMS: карточки, услуги, теги и тексты редактируются из закрытой страницы владельца."
          showBack
        />

        <FilterPanel title="Фильтр СПА и оздоровления">
          <WellnessFilters
            value={wellnessFiltersState}
            onChange={setWellnessFiltersState}
            serviceOptions={wellnessServiceOptions}
          />
        </FilterPanel>

        <section className="grid-listing">
          {filteredWellness.map((item: GuidePlace) => (
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
              analytics={{ placeId: item.id, categoryId: item.categoryId }}
              meta={compactStrings([
                item.kind,
                ...item.services,
                item.childPrograms ? 'Есть детские программы' : undefined,
                ...item.tags
              ])}
            />
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={categoryMeta?.title ?? 'Раздел'}
        subtitle={categoryMeta?.description ?? 'Карточки этого раздела редактируются владельцем из owner-CMS.'}
        showBack
      />

      {categoryPlaces.length > 0 ? (
        <section className="grid-listing">
          {categoryPlaces.map((item: GuidePlace) => (
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
              analytics={{ placeId: item.id, categoryId: item.categoryId }}
              meta={compactStrings([
                item.kind,
                item.cuisine,
                item.avgCheck ? `Средний чек ${item.avgCheck}` : undefined,
                ...item.services,
                ...item.tags
              ])}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}
