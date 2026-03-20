import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { homeCategories } from '../data/categories';
import { logoutOwner } from '../utils/ownerAuth';

const managementModules = [
  {
    title: 'Карточки и тексты',
    description: 'Добавление новых мест, редактирование описаний, адресов, чеков, тегов и фото.'
  },
  {
    title: 'Подборки и топы',
    description: 'Настройка блоков “Популярное”, советов, маршрутов и сезонных подборок на главной.'
  },
  {
    title: 'Фильтры и параметры',
    description: 'Управление фильтрами каждой рубрики и будущими атрибутами карточек.'
  },
  {
    title: 'Публикация',
    description: 'Черновики, статус видимости, приоритет вывода, баннеры и быстрые обновления разделов.'
  }
];

const ownerCategoryMeta: Record<string, { count: number; status: string }> = {
  restaurants: { count: 18, status: 'Готов к наполнению' },
  wellness: { count: 9, status: 'Готов к наполнению' },
  'active-rest': { count: 0, status: 'Пустой раздел' },
  routes: { count: 6, status: 'Нужны карточки' },
  hotels: { count: 0, status: 'Пустой раздел' },
  events: { count: 4, status: 'Черновики' },
  transport: { count: 0, status: 'Пустой раздел' },
  atm: { count: 12, status: 'Нужна проверка' },
  shops: { count: 0, status: 'Пустой раздел' },
  culture: { count: 10, status: 'Готов к наполнению' },
  kids: { count: 0, status: 'Пустой раздел' },
  medicine: { count: 0, status: 'Пустой раздел' },
  'photo-spots': { count: 5, status: 'Есть основа' },
  'car-rental': { count: 0, status: 'Пустой раздел' }
};

export function OwnerPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutOwner();
    navigate('/owner-login', { replace: true });
  };

  return (
    <div className="page-stack owner-page">
      <PageHeader
        title="Owner page"
        subtitle="Отдельная защищённая страница для наполнения разделов, карточек и главной витрины приложения."
        showBack
      />

      <section className="owner-dashboard">
        <div className="owner-dashboard__hero">
          <div>
            <span className="eyebrow">Управление</span>
            <h2>Панель владельца guide-приложения</h2>
            <p>
              Здесь собраны быстрые действия для наполнения каждой рубрики. Позже этот экран можно
              подключить к базе данных и сделать настоящую CMS с добавлением, редактированием и
              публикацией карточек.
            </p>
          </div>

          <div className="owner-dashboard__actions">
            <button className="button button--primary" type="button">
              Добавить карточку
            </button>
            <Link className="button button--ghost" to="/">
              Посмотреть главную
            </Link>
            <button className="button button--ghost" type="button" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>

        <div className="owner-summary-grid">
          {managementModules.map((module) => (
            <article key={module.title} className="owner-summary-card">
              <span className="owner-module__label">Функция</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="owner-category-manager">
        <div className="section-heading section-heading--poster owner-category-manager__heading">
          <div>
            <span className="eyebrow">Категории</span>
            <h2>Наполнение каждой рубрики</h2>
          </div>
        </div>

        <div className="owner-category-list">
          {homeCategories.map((category) => {
            const meta = ownerCategoryMeta[category.id] ?? { count: 0, status: 'Пустой раздел' };

            return (
              <article key={category.id} className="owner-category-card">
                <div className="owner-category-card__top">
                  <div className="owner-category-card__title-wrap">
                    <h3>{category.title}</h3>
                    <p>{meta.status}</p>
                  </div>

                  <div className="owner-category-card__count">{meta.count} карточек</div>
                </div>

                <div className="owner-category-card__actions">
                  <button className="button button--primary" type="button">
                    Добавить
                  </button>
                  <button className="button button--ghost" type="button">
                    Редактировать
                  </button>
                  <button className="button button--ghost" type="button">
                    Баннеры и топы
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
