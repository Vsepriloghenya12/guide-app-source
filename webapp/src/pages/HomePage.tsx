import { CategoryList } from '../components/home/CategoryList';
import { FeatureGrid } from '../components/home/FeatureGrid';
import { HomeHero } from '../components/home/HomeHero';

export function HomePage() {
  return (
    <div className="page-stack home-page">
      <HomeHero />
      <FeatureGrid />
      <CategoryList />
    </div>
  );
}
