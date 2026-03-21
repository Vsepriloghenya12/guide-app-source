import { CategoryList } from '../components/home/CategoryList';
import { FeatureGrid } from '../components/home/FeatureGrid';
import { HomeHero } from '../components/home/HomeHero';
import { useGuideContent } from '../hooks/useGuideContent';
import type { GuideCategory, GuideCollection, GuidePlace, GuideTip, HomeBanner } from '../types';

export function HomePage() {
  const { places, categories, tips, banners, collections, home } = useGuideContent();

  const activeCategories = categories.filter((category: GuideCategory) => category.visible);
  const activeBanners = home.bannerIds
    .map((id: string) => banners.find((banner: HomeBanner) => banner.id === id && banner.active))
    .filter((banner): banner is HomeBanner => Boolean(banner));
  const activePopularPlaces = home.popularPlaceIds
    .map((id: string) => places.find((place: GuidePlace) => place.id === id))
    .filter((place): place is GuidePlace => Boolean(place));
  const fallbackPopularPlaces = places.filter((place: GuidePlace) => place.top).slice(0, 4);
  const popularPlaces = activePopularPlaces.length > 0 ? activePopularPlaces : fallbackPopularPlaces;
  const featuredCategories = home.featuredCategoryIds
    .map((id) => activeCategories.find((category: GuideCategory) => category.id === id))
    .filter((category): category is GuideCategory => Boolean(category));
  const visibleTips = home.tipIds
    .map((id: string) => tips.find((tip: GuideTip) => tip.id === id && tip.active))
    .filter((tip): tip is GuideTip => Boolean(tip));
  const activeCollections = home.collectionIds
    .map((id: string) => collections.find((collection: GuideCollection) => collection.id === id && collection.active))
    .filter((collection): collection is GuideCollection => Boolean(collection));

  return (
    <div className="page-stack home-page home-page--poster">
      <section className="home-stage" aria-label="Главный экран Guide">
        <HomeHero banners={activeBanners} />
        <FeatureGrid
          popularPlaces={popularPlaces}
          featuredCategories={featuredCategories}
          tips={visibleTips}
          collections={activeCollections}
          sectionTitles={home.sectionTitles}
        />
      </section>

      <CategoryList categories={activeCategories} title={home.sectionTitles.allCategories} />
    </div>
  );
}
