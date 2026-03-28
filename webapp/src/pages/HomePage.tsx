import { CategoryList } from '../components/home/CategoryList';
import { FeatureGrid } from '../components/home/FeatureGrid';
import { HomeHero } from '../components/home/HomeHero';
import { useGuideContent } from '../hooks/useGuideContent';
import { usePageMeta } from '../hooks/usePageMeta';
import { sortPlacesByPriority } from '../utils/places';
import type { GuideCategory, GuideCollection, GuidePlace, GuideTip, HomeBanner } from '../types';

export function HomePage() {
  usePageMeta({
    title: 'Danang Guide',
    description: 'Главная страница с местами, категориями, советами и подборками в Дананге.'
  });

  const { places, categories, tips, banners, collections, home, loading, error } = useGuideContent();

  const activeCategories = categories.filter((category: GuideCategory) => category.visible);
  const activeBanners = home.bannerIds
    .map((id: string) => banners.find((banner: HomeBanner) => banner.id === id && banner.active))
    .filter((banner): banner is HomeBanner => Boolean(banner));
  const activePopularPlaces = home.popularPlaceIds
    .map((id: string) => places.find((place: GuidePlace) => place.id === id))
    .filter((place): place is GuidePlace => Boolean(place));
  const fallbackPopularPlaces = sortPlacesByPriority(places.filter((place: GuidePlace) => place.top)).slice(0, 6);
  const popularPlaces = activePopularPlaces.length > 0 ? activePopularPlaces : fallbackPopularPlaces;
  const upcomingEvents = sortPlacesByPriority(places.filter((place: GuidePlace) => place.categoryId === 'events')).slice(0, 4);
  const featuredCategories = home.featuredCategoryIds
    .map((id) => activeCategories.find((category: GuideCategory) => category.id === id))
    .filter((category): category is GuideCategory => Boolean(category));
  const quickCategories = [
    ...featuredCategories,
    ...activeCategories.filter((category) => !featuredCategories.some((item) => item.id === category.id))
  ].slice(0, 4);
  const visibleTips = home.tipIds
    .map((id: string) => tips.find((tip: GuideTip) => tip.id === id && tip.active))
    .filter((tip): tip is GuideTip => Boolean(tip));
  const activeCollections = home.collectionIds
    .map((id: string) => collections.find((collection: GuideCollection) => collection.id === id && collection.active))
    .filter((collection): collection is GuideCollection => Boolean(collection));

  return (
    <div className="page-stack home-page home-page--rebuild">
      {loading ? <div className="panel page-loader">Загружаю главную страницу…</div> : null}
      {error ? (
        <div className="panel empty-state empty-state--left">
          <strong>Временные трудности с загрузкой</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <HomeHero banners={activeBanners} />
      <FeatureGrid
        popularPlaces={popularPlaces}
        featuredCategories={quickCategories}
        tips={visibleTips}
        collections={activeCollections}
        upcomingEvents={upcomingEvents}
        sectionTitles={home.sectionTitles}
      />
      <CategoryList categories={activeCategories} places={places} title={home.sectionTitles.allCategories || 'Все рубрики'} />
    </div>
  );
}
