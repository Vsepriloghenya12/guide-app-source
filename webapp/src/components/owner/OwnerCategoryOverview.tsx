import { homeCategories } from '../../data/categories';

type OwnerCategoryOverviewProps = {
  restaurantsCount: number;
  wellnessCount: number;
};

const categoryStatusMap: Record<string, string> = {
  restaurants: 'Есть полноценная CMS для карточек',
  wellness: 'Есть полноценная CMS для карточек',
  'active-rest': 'Раздел подготовлен, ждёт наполнение',
  routes: 'Можно добавлять контент на следующем этапе',
  hotels: 'Раздел подготовлен, ждёт наполнение',
  events: 'Подойдёт для афиши и баннеров',
  transport: 'Раздел подготовлен, ждёт наполнение',
  atm: 'Можно подключить карту и точки',
  shops: 'Раздел подготовлен, ждёт наполнение',
  culture: 'Подойдёт для достопримечательностей и гайдов',
  kids: 'Раздел подготовлен, ждёт наполнение',
  medicine: 'Раздел подготовлен, ждёт наполнение',
  'photo-spots': 'Подойдёт для локаций и точек на карте',
  'car-rental': 'Раздел подготовлен, ждёт наполнение'
};

export function OwnerCategoryOverview({ restaurantsCount, wellnessCount }: OwnerCategoryOverviewProps) {
  return (
    <section className="owner-category-manager">
      <div className="section-heading section-heading--poster owner-category-manager__heading">
        <div>
          <span className="eyebrow">Категории</span>
          <h2>Структура разделов</h2>
        </div>
      </div>

      <div className="owner-category-list">
        {homeCategories.map((category) => {
          const count =
            category.id === 'restaurants' ? restaurantsCount : category.id === 'wellness' ? wellnessCount : 0;

          return (
            <article key={category.id} className="owner-category-card">
              <div className="owner-category-card__top">
                <div className="owner-category-card__title-wrap">
                  <h3>{category.title}</h3>
                  <p>{categoryStatusMap[category.id] ?? 'Раздел готов к дальнейшей доработке'}</p>
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
