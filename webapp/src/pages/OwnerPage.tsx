import { PageHeader } from '../components/layout/PageHeader';

const ownerModules = [
  {
    title: 'Контент и карточки',
    description: 'Управление ресторанами, СПА, фото, описаниями, тегами и подборками.'
  },
  {
    title: 'Категории и маршруты',
    description: 'Настройка разделов, внутренних страниц, маршрутов и специальных подборок.'
  },
  {
    title: 'Модерация и публикация',
    description: 'Черновики, статус публикации, приоритет карточек, выделение в топе.'
  },
  {
    title: 'Аналитика',
    description: 'Просмотры, сохранения, клики в контакты, популярные категории и карточки.'
  }
];

export function OwnerPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Страница владельца"
        subtitle="Сейчас это стильный каркас под будущую систему управления приложением."
        showBack
      />

      <section className="owner-hero card">
        <div>
          <span className="eyebrow">Owner panel</span>
          <h2>Центр управления guide-приложением</h2>
          <p>
            Здесь потом можно добавить авторизацию владельца, редактирование карточек,
            публикацию контента, баннеры, аналитику и управление всеми разделами.
          </p>
        </div>

        <div className="owner-stats">
          <div className="owner-stat">
            <strong>14</strong>
            <span>Разделов</span>
          </div>
          <div className="owner-stat">
            <strong>2</strong>
            <span>Готовых листинга</span>
          </div>
          <div className="owner-stat">
            <strong>PWA</strong>
            <span>Готово к установке</span>
          </div>
        </div>
      </section>

      <section className="owner-grid">
        {ownerModules.map((module) => (
          <article key={module.title} className="card card--interactive owner-module">
            <span className="owner-module__label">Модуль</span>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
            <button className="button button--ghost button--full" type="button">
              Скоро добавим функционал
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
