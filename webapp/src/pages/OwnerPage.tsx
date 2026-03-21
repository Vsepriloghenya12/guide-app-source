import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { OwnerCategoryOverview } from '../components/owner/OwnerCategoryOverview';
import { OwnerHomeManager } from '../components/owner/OwnerHomeManager';
import { OwnerPlacesManager } from '../components/owner/OwnerPlacesManager';
import { OwnerTipsManager } from '../components/owner/OwnerTipsManager';
import { resetGuideContent } from '../data/guideContent';
import { useGuideContent } from '../hooks/useGuideContent';
import { logoutOwner } from '../utils/ownerAuth';

export function OwnerPage() {
  const navigate = useNavigate();
  const { places, categories, tips, banners, collections, home } = useGuideContent();

  const handleLogout = () => {
    logoutOwner();
    navigate('/owner-login', { replace: true });
  };

  const handleReset = () => {
    resetGuideContent();
  };

  const topPlacesCount = places.filter((place: { top: boolean }) => place.top).length;

  return (
    <div className="page-stack owner-page">
      <PageHeader
        title="Owner CMS"
        subtitle="Закрытая система управления контентом: карточки, фото, главная страница, категории, советы, баннеры и подборки управляются из одной панели."
        badgeLabel="Owner CMS"
      />

      <section className="owner-dashboard">
        <div className="owner-dashboard__hero">
          <div>
            <span className="eyebrow">Управление контентом</span>
            <h2>Полноценная CMS владельца</h2>
            <p>
              Эта версия уже похожа на рабочую админку: можно управлять карточками мест,
              фотографиями, контактами, главной страницей, советами, баннерами и подборками.
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
            <span className="owner-module__label">Карточки</span>
            <h3>{places.length} карточек</h3>
            <p>Все карточки редактируются в одной системе с выбором категории и фото.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">Топ</span>
            <h3>{topPlacesCount} карточек</h3>
            <p>Отдельный переключатель управляет показом в блоке “Популярное”.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">Главная</span>
            <h3>{banners.length} баннеров</h3>
            <p>Главная страница собирается из баннеров, советов, категорий и подборок.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">Контент</span>
            <h3>{tips.length} советов / {collections.length} подборок</h3>
            <p>Тексты и подборки редактируются отдельно и подключаются к главной.</p>
          </article>
        </div>
      </section>

      <OwnerPlacesManager items={places} categories={categories} />
      <OwnerCategoryOverview categories={categories} />
      <OwnerTipsManager tips={tips} />
      <OwnerHomeManager
        home={home}
        places={places}
        categories={categories}
        tips={tips}
        banners={banners}
        collections={collections}
      />
    </div>
  );
}
