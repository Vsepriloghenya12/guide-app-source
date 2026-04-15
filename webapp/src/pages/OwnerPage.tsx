import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OwnerAnalyticsPanel } from '../components/owner/OwnerAnalyticsPanel';
import { OwnerCategoryOverview } from '../components/owner/OwnerCategoryOverview';
import { OwnerContactsManager } from '../components/owner/OwnerContactsManager';
import { OwnerHomeManager } from '../components/owner/OwnerHomeManager';
import { OwnerMediaLibrary } from '../components/owner/OwnerMediaLibrary';
import { OwnerPlacesManager } from '../components/owner/OwnerPlacesManager';
import { OwnerTipsManager } from '../components/owner/OwnerTipsManager';
import { useGuideContent } from '../hooks/useGuideContent';
import { OWNER_AUTH_REQUIRED_EVENT } from '../utils/ownerEvents';

type OwnerTabId = 'places' | 'categories' | 'tips' | 'home' | 'contacts' | 'media' | 'analytics';

const ownerTabs: Array<{ id: OwnerTabId; label: string }> = [
  { id: 'places', label: 'Карточки' },
  { id: 'categories', label: 'Категории' },
  { id: 'tips', label: 'Советы' },
  { id: 'home', label: 'Главная' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'media', label: 'Медиа' },
  { id: 'analytics', label: 'Клики' }
];

function isOwnerTabId(value: string | null): value is OwnerTabId {
  return ownerTabs.some((tab) => tab.id === value);
}

export function OwnerPage() {
  const navigate = useNavigate();
  const { places, categories, tips, collections, home, analytics } = useGuideContent({ scope: 'owner' });
  const [activeTab, setActiveTab] = useState<OwnerTabId>(() => {
    if (typeof window === 'undefined') {
      return 'places';
    }

    const savedTab = window.localStorage.getItem('owner-active-tab');
    return isOwnerTabId(savedTab) ? savedTab : 'places';
  });

  useEffect(() => {
    const handleAuthRequired = () => {
      navigate('/owner-login', { replace: true, state: { from: '/owner' } });
    };

    window.addEventListener(OWNER_AUTH_REQUIRED_EVENT, handleAuthRequired);
    return () => window.removeEventListener(OWNER_AUTH_REQUIRED_EVENT, handleAuthRequired);
  }, [navigate]);

  useEffect(() => {
    window.localStorage.setItem('owner-active-tab', activeTab);
  }, [activeTab]);

  const handleTabChange = (tabId: OwnerTabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  let activePanel = null;

  if (activeTab === 'places') {
    activePanel = <OwnerPlacesManager items={places} categories={categories} />;
  } else if (activeTab === 'categories') {
    activePanel = <OwnerCategoryOverview categories={categories} />;
  } else if (activeTab === 'tips') {
    activePanel = <OwnerTipsManager tips={tips} />;
  } else if (activeTab === 'home') {
    activePanel = (
      <OwnerHomeManager
        home={home}
        places={places}
        categories={categories}
        tips={tips}
        collections={collections}
      />
    );
  } else if (activeTab === 'contacts') {
    activePanel = <OwnerContactsManager />;
  } else if (activeTab === 'media') {
    activePanel = <OwnerMediaLibrary />;
  } else if (activeTab === 'analytics') {
    activePanel = <OwnerAnalyticsPanel events={analytics.events} categories={categories} places={places} />;
  }

  return (
    <div className="owner-page owner-page--minimal">
      <section className="owner-controls">
        <nav className="owner-controls__tabs" aria-label="Разделы управления">
          {ownerTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`button button--ghost owner-controls__tab ${activeTab === tab.id ? 'is-active' : ''}`}
              aria-pressed={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      <div className="owner-page__panel">{activePanel}</div>
    </div>
  );
}
