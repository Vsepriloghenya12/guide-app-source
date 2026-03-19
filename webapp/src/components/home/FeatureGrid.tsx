import { Link } from 'react-router-dom';
import { homeFeatures } from '../../data/categories';

export function FeatureGrid() {
  return (
    <section className="feature-grid">
      {homeFeatures.map((feature) => (
        <Link key={feature.id} to={feature.path} className="feature-card card card--interactive">
          <span className="feature-card__kicker">Подборка</span>
          <h2>{feature.title}</h2>
          <p>{feature.description}</p>
          <span className="feature-card__more">Открыть →</span>
        </Link>
      ))}
    </section>
  );
}
