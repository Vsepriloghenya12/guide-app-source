import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { OwnerAnalyticsPanel } from '../components/owner/OwnerAnalyticsPanel';
import { OwnerCategoryOverview } from '../components/owner/OwnerCategoryOverview';
import { OwnerHomeManager } from '../components/owner/OwnerHomeManager';
import { OwnerContactsManager } from '../components/owner/OwnerContactsManager';
import { OwnerMediaLibrary } from '../components/owner/OwnerMediaLibrary';
import { OwnerPlacesManager } from '../components/owner/OwnerPlacesManager';
import { OwnerTipsManager } from '../components/owner/OwnerTipsManager';
import { resetGuideContent } from '../data/guideContent';
import { useGuideContent } from '../hooks/useGuideContent';
import { logoutOwner } from '../utils/ownerAuth';
import { OWNER_AUTH_REQUIRED_EVENT } from '../utils/ownerEvents';

type OwnerTabId = 'overview' | 'places' | 'categories' | 'tips' | 'home' | 'contacts' | 'media' | 'analytics';

const ownerTabs: Array<{ id: OwnerTabId; label: string; description: string }> = [
  {
    id: 'overview',
    label: 'Обзор',
    description: 'Главные цифры по карточкам, контенту и переходам.'
  },
  {
    id: 'places',
    label: 'Карточки',
    description: 'Места, фото, статусы, порядок показа и координаты.'
  },
  {
    id: 'categories',
    label: 'Категории',
    description: 'Названия разделов, ссылки, бейджи и обложки.'
  },
  {
    id: 'tips',
    label: 'Советы',
    description: 'Советы и тексты, которые видят пользователи.'
  },
  {
    id: 'home',
    label: 'Главная',
    description: 'Популярное, баннеры и подборки на главной.'
  },
  {
    id: 'contacts',
    label: 'Контакты',
    description: 'Телефон, мессенджеры, e-mail и экстренные номера.'
  },
  {
    id: 'media',
    label: 'Медиа',
    description: 'Все загруженные изображения и их ссылки.'
  },
  {
    id: 'analytics',
    label: 'Клики',
    description: 'Просмотры страниц и клики по разделам и карточкам.'
  }
];

export function OwnerPage() {
  const navigate = useNavigate();
  const { places, categories, tips, banners, collections, home, analytics } = useGuideContent({ scope: 'owner' });
  const [activeTab, setActiveTab] = useState<OwnerTabId>('overview');

  const handleLogout = async () => {
    try {
      await logoutOwner();
    } finally {
      navigate('/owner-login', { replace: true });
    }
  };

  const handleReset = async () => {
    await resetGuideContent();
  };

  useEffect(() => {
    const handleAuthRequired = () => {
      navigate('/owner-login', { replace: true, state: { from: '/owner' } });
    };

    window.addEventListener(OWNER_AUTH_REQUIRED_EVENT, handleAuthRequired);
    return () => window.removeEventListener(OWNER_AUTH_REQUIRED_EVENT, handleAuthRequired);
  }, [navigate]);

  const topPlacesCount = places.filter((place: { top: boolean }) => place.top).length;

  return (
    <div className="page-stack owner-page">
      <PageHeader
        title="Панель управления"
        subtitle="Управляй карточками, разделами, главной страницей и контактами из одной панели."
        showBack
        badgeLabel="Админка"
      />

      <section className="owner-dashboard">
        <div className="owner-dashboard__hero">
          <div>
            <span className="eyebrow">Управление контентом</span>
            <h2>Управление по разделам</h2>
            <p>
              Каждая вкладка отвечает за свой раздел: карточки мест, категории, главную страницу, контакты и статистику.
            </p>
          </div>

          <div className="owner-dashboard__actions">
            <Link className="button button--ghost" to="/" target="_blank" rel="noreferrer">
              Открыть публичное приложение
            </Link>
            <button className="button button--ghost" type="button" onClick={handleReset}>
              Сбросить контент
            </button>
            <button className="button button--primary" type="button" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>

        <div className="owner-inline-tabs owner-panel-tabs">
          {ownerTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`button button--ghost owner-panel-tab ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="owner-panel-tab__title">{tab.label}</span>
              <span className="owner-panel-tab__desc">{tab.description}</span>
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'overview' ? (
        <section className="owner-cms-section">
          <div className="owner-cms-section__header">
            <div>
              <span className="eyebrow">CMS / обзор</span>
              <h2>Общая сводка</h2>
              <p>Быстро видно объём контента и активность пользователей без перехода по остальным вкладкам.</p>
            </div>
          </div>

          <div className="owner-summary-grid owner-summary-grid--compact">
            <article className="owner-summary-card">
              <span className="owner-module__label">Карточки</span>
              <h3>{places.length} карточек</h3>
              <p>Все карточки редактируются с фото, контактами, тегами и разбивкой по категориям.</p>
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
            <article className="owner-summary-card">
              <span className="owner-module__label">Переходы</span>
              <h3>{analytics.events.filter((event) => event.kind === 'page-view').length} просмотров</h3>
              <p>Сколько раз пользователи открывали разделы приложения.</p>
            </article>
            <article className="owner-summary-card">
              <span className="owner-module__label">Клики</span>
              <h3>{analytics.events.filter((event) => event.kind !== 'page-view').length} кликов</h3>
              <p>Баннеры, категории, советы, карточки и внешние кнопки сайта и телефона.</p>
            </article>
          </div>
        </section>
      ) : null}

      {activeTab === 'places' ? <OwnerPlacesManager items={places} categories={categories} /> : null}
      {activeTab === 'categories' ? <OwnerCategoryOverview categories={categories} /> : null}
      {activeTab === 'tips' ? <OwnerTipsManager tips={tips} /> : null}
      {activeTab === 'home' ? (
        <OwnerHomeManager
          home={home}
          places={places}
          categories={categories}
          tips={tips}
          banners={banners}
          collections={collections}
        />
      ) : null}
      {activeTab === 'contacts' ? <OwnerContactsManager /> : null}
      {activeTab === 'media' ? <OwnerMediaLibrary /> : null}
      {activeTab === 'analytics' ? (
        <OwnerAnalyticsPanel events={analytics.events} categories={categories} places={places} />
      ) : null}
    </div>
  );
}
