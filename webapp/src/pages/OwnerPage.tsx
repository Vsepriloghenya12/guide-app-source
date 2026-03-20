import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { OwnerCategoryOverview } from '../components/owner/OwnerCategoryOverview';
import { OwnerRestaurantManager } from '../components/owner/OwnerRestaurantManager';
import { OwnerSettingsManager } from '../components/owner/OwnerSettingsManager';
import { OwnerWellnessManager } from '../components/owner/OwnerWellnessManager';
import { useOwnerBootstrap } from '../hooks/useOwnerBootstrap';
import { logoutOwner } from '../utils/ownerAuth';

export function OwnerPage() {
  const navigate = useNavigate();
  const { restaurants, wellness, settings, loading, error, reload } = useOwnerBootstrap();

  const handleLogout = () => {
    logoutOwner();
    navigate('/owner-login', { replace: true });
  };

  return (
    <div className="page-stack owner-page">
      <PageHeader
        title="Owner CMS"
        subtitle="Отдельная закрытая mini-CMS. Данные сохраняются через backend, карточки и советы главной страницы обновляются из owner-панели."
        badgeLabel="Owner CMS"
      />

      <section className="owner-dashboard">
        <div className="owner-dashboard__hero">
          <div>
            <span className="eyebrow">Управление контентом</span>
            <h2>Рабочая мини-CMS владельца</h2>
            <p>
              Сейчас здесь уже работают backend-авторизация, сохранение карточек через API, загрузка
              изображений и управление блоком советов на главной. Геолокацию и контакты пока не трогаем.
            </p>
          </div>

          <div className="owner-dashboard__actions">
            <button className="button button--ghost" type="button" onClick={() => reload()}>
              Обновить данные
            </button>
            <button className="button button--primary" type="button" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>

        <div className="owner-summary-grid owner-summary-grid--compact">
          <article className="owner-summary-card">
            <span className="owner-module__label">Рестораны</span>
            <h3>{restaurants.length} карточек</h3>
            <p>Полный CRUD, фильтры и публикация в публичный раздел уже работают.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">СПА</span>
            <h3>{wellness.length} карточек</h3>
            <p>Отдельный модуль с услугами, фото, статусами и публикацией в раздел.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">Главная</span>
            <h3>{settings.homeTips.length} совета</h3>
            <p>Блок «Советы» редактируется прямо здесь и сразу обновляется в приложении.</p>
          </article>
          <article className="owner-summary-card">
            <span className="owner-module__label">Данные</span>
            <h3>API + DB</h3>
            <p>Если подключить DATABASE_URL на Railway, приложение перейдёт на PostgreSQL.</p>
          </article>
        </div>
      </section>

      {loading ? (
        <section className="card card--placeholder">
          <div className="placeholder-state">
            <span className="placeholder-state__badge">Загрузка</span>
            <h2>Подгружаем owner-CMS</h2>
            <p>Загружаем карточки, советы на главной и настройки.</p>
          </div>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="card card--placeholder">
          <div className="placeholder-state">
            <span className="placeholder-state__badge">Ошибка</span>
            <h2>Не удалось открыть owner-CMS</h2>
            <p>{error}</p>
            <div className="placeholder-state__actions">
              <button className="button button--primary" type="button" onClick={() => reload()}>
                Повторить
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {!loading && !error ? (
        <>
          <OwnerCategoryOverview restaurantsCount={restaurants.length} wellnessCount={wellness.length} />
          <OwnerSettingsManager items={settings.homeTips} onUpdated={reload} />
          <OwnerRestaurantManager items={restaurants} onUpdated={reload} />
          <OwnerWellnessManager items={wellness} onUpdated={reload} />
        </>
      ) : null}
    </div>
  );
}
