import { homeCategories } from '../../data/categories';

type OwnerCategoryOverviewProps = {
  restaurantsCount: number;
  wellnessCount: number;
};

const categoryStatusMap: Record<string, string> = {
  restaurants: 'Активно: полная CMS, публикация и фильтры уже работают.',
  wellness: 'Активно: полная CMS, публикация и фильтры уже работают.',
  'active-rest': 'Подготовлено: подключим после базовых разделов.',
  routes: 'Подготовлено: позже добавим маршруты и точки.',
  hotels: 'Подготовлено: позже добавим размещение и подборки.',
  events: 'Подготовлено: потом подключим афишу.',
  transport: 'Подготовлено: потом подключим транспорт.',
  atm: 'Подготовлено: потом подключим банкоматы.',
  shops: 'Подготовлено: потом подключим магазины и сувениры.',
  culture: 'Подготовлено: потом подключим достопримечательности.',
  kids: 'Подготовлено: потом подключим детский отдых.',
  medicine: 'Подготовлено: потом подключим медицину.',
  'photo-spots': 'Подготовлено: потом подключим смотровые и фотозоны.',
  'car-rental': 'Подготовлено: потом подключим аренду авто.'
};

export function OwnerCategoryOverview({ restaurantsCount, wellnessCount }: OwnerCategoryOverviewProps) {
  return (
    <section className="owner-category-manager">
      <div className="section-heading section-heading--poster owner-category-manager__heading">
        <div>
          <span className="eyebrow">Категории</span>
          <h2>Что уже подключено</h2>
        </div>
      </div>

      <div className="owner-category-list">
        {homeCategories.map((category) => {
          const count = category.id === 'restaurants' ? restaurantsCount : category.id === 'wellness' ? wellnessCount : 0;
          const isActive = category.id === 'restaurants' || category.id === 'wellness';

          return (
            <article key={category.id} className={`owner-category-card${isActive ? ' owner-category-card--active' : ''}`}>
              <div className="owner-category-card__top">
                <div className="owner-category-card__title-wrap">
                  <h3>{category.title}</h3>
                  <p>{categoryStatusMap[category.id] ?? 'Раздел готов к дальнейшей доработке.'}</p>
                </div>

                <div className="owner-category-card__count">{count} карточек</div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
