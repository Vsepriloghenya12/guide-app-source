import { FeatureGrid } from '../components/home/FeatureGrid';
import { HomeHero } from '../components/home/HomeHero';
import { useGuideContent } from '../hooks/useGuideContent';
import { usePageMeta } from '../hooks/usePageMeta';
import type { GuideCategory, GuideTip, HomeBanner } from '../types';

export function HomePage() {
  usePageMeta({
    title: 'Danang Guide',
    description: 'Главная страница с местами, категориями, советами, подборками и событиями в Дананге.'
  });
  const { categories, tips, banners, home, loading, error } = useGuideContent();

  const activeCategories = categories.filter((category: GuideCategory) => category.visible);
  const featuredCategories = ['restaurants', 'events', 'hotels', 'shops']
    .map((id) => activeCategories.find((category: GuideCategory) => category.id === id))
    .filter((category): category is GuideCategory => Boolean(category));
  const visibleTips = home.tipIds
    .map((id: string) => tips.find((tip: GuideTip) => tip.id === id && tip.active))
    .filter((tip): tip is GuideTip => Boolean(tip));
  const visibleBanners = home.bannerIds
    .map((id: string) => banners.find((banner: HomeBanner) => banner.id === id && banner.active))
    .filter((banner): banner is HomeBanner => Boolean(banner));
  return (
    <div className="page-stack home-page reference-home-page">
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
        banners={visibleBanners}
        tips={visibleTips}
        sectionTitles={home.sectionTitles}
      />
    </div>
  );
}
