import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { OwnerCategoryOverview } from '../components/owner/OwnerCategoryOverview';
import { OwnerRestaurantManager } from '../components/owner/OwnerRestaurantManager';
import { OwnerWellnessManager } from '../components/owner/OwnerWellnessManager';
import { resetGuideContent } from '../data/guideContent';
import { useGuideContent } from '../hooks/useGuideContent';
import { logoutOwner } from '../utils/ownerAuth';

export function OwnerPage() {
  const navigate = useNavigate();
  const { restaurants, wellness, isLoading } = useGuideContent();

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
              Здесь уже можно добавлять, редактировать и удалять карточки ресторанов и СПА прямо из
              интерфейса. Публичные разделы берут данные с сервера, а owner-операции теперь
              защищены серверной сессией.
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
            <h3>{isLoading ? "…" : `${restaurants.length} карточек`}</h3>
            <p>Полный модуль добавления и редактирования уже активен.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">СПА</span>
            <h3>{isLoading ? "…" : `${wellness.length} карточек`}</h3>
            <p>Карточки создаются и редактируются прямо на этой странице.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">Ссылка</span>
            <h3>/owner-login</h3>
            <p>Вход проверяется на сервере и открывает отдельную owner-сессию.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">Дальше</span>
            <h3>База данных</h3>
            <p>Второй этап уже готов: owner-CRUD закрыт серверной авторизацией и больше не зависит от фронтового пароля.</p>
          </article>
        </div>
      </section>

      <OwnerCategoryOverview restaurantsCount={restaurants.length} wellnessCount={wellness.length} />
      <OwnerRestaurantManager items={restaurants} />
      <OwnerWellnessManager items={wellness} />
    </div>
  );
}
