import { FeatureGrid } from '../components/home/FeatureGrid';
import { HomeHero } from '../components/home/HomeHero';
import { useGuideContent } from '../hooks/useGuideContent';
import { usePageMeta } from '../hooks/usePageMeta';
import type { GuideCategory, GuideCollection, GuideTip } from '../types';

export function HomePage() {
  usePageMeta({
    title: 'Danang Guide',
    description: 'Главная страница с местами, категориями, советами и программами в Дананге.'
  });
  const { categories, tips, collections, home, loading, error } = useGuideContent();

  const activeCategories = categories.filter((category: GuideCategory) => category.visible);
  const featuredCategories = ['restaurants', 'events', 'hotels', 'shops']
    .map((id) => activeCategories.find((category: GuideCategory) => category.id === id))
    .filter((category): category is GuideCategory => Boolean(category));
  const visibleTips = home.tipIds
    .map((id: string) => tips.find((tip: GuideTip) => tip.id === id && tip.active))
    .filter((tip): tip is GuideTip => Boolean(tip));
  const heroBanners = home.collectionIds
    .map((id: string) => collections.find((collection: GuideCollection) => collection.id === id && collection.active))
    .filter((collection): collection is GuideCollection => Boolean(collection));
  return (
    <div className="page-stack home-page home-page--open reference-home-page">
      {loading ? <div className="panel page-loader">Загружаю главную страницу…</div> : null}
      {error ? (
        <div className="panel empty-state empty-state--left">
          <strong>Временные трудности с загрузкой</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <div className="home-hero-bleed">
        <HomeHero />
      </div>
      <FeatureGrid
        featuredCategories={featuredCategories}
        allCategories={activeCategories}
        heroBanners={heroBanners}
        tips={visibleTips}
        sectionTitles={home.sectionTitles}
      />
    </div>
  );
}
