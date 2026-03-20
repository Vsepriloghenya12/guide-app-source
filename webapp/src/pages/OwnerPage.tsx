import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { OwnerCategoryOverview } from '../components/owner/OwnerCategoryOverview';
import { OwnerHomeManager } from '../components/owner/OwnerHomeManager';
import { OwnerRestaurantManager } from '../components/owner/OwnerRestaurantManager';
import { OwnerWellnessManager } from '../components/owner/OwnerWellnessManager';
import { resetGuideContent } from '../data/guideContent';
import { useGuideContent } from '../hooks/useGuideContent';
import { logoutOwner } from '../utils/ownerAuth';

export function OwnerPage() {
  const navigate = useNavigate();
  const { restaurants, wellness, home, isLoading } = useGuideContent();

  const handleLogout = async () => {
    await logoutOwner();
    navigate('/owner-login', { replace: true });
  };

  const handleReset = async () => {
    try {
      await resetGuideContent();
    } catch (error) {
      console.error('Owner reset failed', error);
    }
  };

  const publishedRestaurants = restaurants.filter((item) => item.status === 'published').length;
  const publishedWellness = wellness.filter((item) => item.status === 'published').length;
  const featuredListings = [...restaurants, ...wellness].filter((item) => item.featured).length;

  return (
    <div className="page-stack owner-page">
      <PageHeader
        title="Owner CMS"
        subtitle="Отдельная закрытая страница управления. Эта ссылка живёт отдельно от публичного приложения и не показывается в нижнем меню или на публичных страницах."
        badgeLabel="Owner CMS"
      />

      <section className="owner-dashboard">
        <div className="owner-dashboard__hero">
          <div>
            <span className="eyebrow">Управление контентом</span>
            <h2>Мини-CMS владельца</h2>
            <p>
              Теперь в owner-части можно не только создавать карточки, но и управлять статусом,
              сортировкой, блоками главной страницы и тем, что реально попадёт в публичное приложение.
            </p>
          </div>

          <div className="owner-dashboard__actions">
            <Link className="button button--ghost" to="/" target="_blank" rel="noreferrer">
              Открыть публичное приложение
            </Link>
            <button className="button button--ghost" type="button" onClick={handleReset}>
              Сбросить demo-данные
            </button>
            <button className="button button--primary" type="button" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>

        <div className="owner-summary-grid owner-summary-grid--compact">
          <article className="owner-summary-card">
            <span className="owner-module__label">Рестораны</span>
            <h3>{isLoading ? '…' : `${publishedRestaurants}/${restaurants.length}`}</h3>
            <p>Опубликовано / всего карточек в разделе ресторанов.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">СПА</span>
            <h3>{isLoading ? '…' : `${publishedWellness}/${wellness.length}`}</h3>
            <p>Опубликовано / всего карточек в разделе СПА и оздоровления.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">Главная</span>
            <h3>{isLoading ? '…' : `${home.popular.length + home.categories.length + home.tips.length} блоков`}</h3>
            <p>Популярное, категории и советы уже редактируются через owner-CMS.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">Топ-показы</span>
            <h3>{isLoading ? '…' : `${featuredListings} карточек`}</h3>
            <p>Карточки с флагом «показывать в топе» можно поднимать выше в разделах и на главной.</p>
          </article>
        </div>
      </section>

      <OwnerHomeManager home={home} />
      <OwnerCategoryOverview restaurantsCount={restaurants.length} wellnessCount={wellness.length} />
      <OwnerRestaurantManager items={restaurants} />
      <OwnerWellnessManager items={wellness} />
    </div>
  );
}
