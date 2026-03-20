import { AppLogo } from '../common/AppLogo';

export function HomeHero() {
  return (
    <section className="hero hero--poster hero--compact">
      <div className="hero__brand hero__brand--center">
        <AppLogo className="hero__logo hero__logo--giant" alt="Логотип Guide" />
      </div>
    </section>
  );
}
