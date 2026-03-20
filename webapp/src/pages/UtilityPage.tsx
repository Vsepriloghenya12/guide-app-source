import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';

type UtilityPageProps = {
  type: 'search' | 'favorites' | 'nearby' | 'help' | 'contacts';
};

const contentMap: Record<UtilityPageProps['type'], { title: string; description: string }> = {
  search: {
    title: 'Поиск',
    description: 'Здесь позже можно сделать глобальный поиск по всем карточкам и категориям.'
  },
  favorites: {
    title: 'Избранное',
    description: 'Сюда можно добавить сохранённые места, маршруты и подборки пользователя.'
  },
  nearby: {
    title: 'Рядом',
    description: 'Этот раздел можно связать с геолокацией и выводить места рядом с пользователем.'
  },
  help: {
    title: 'Помощь',
    description: 'Подготовлено место под FAQ, чат поддержки, полезные инструкции и подсказки.'
  },
  contacts: {
    title: 'Контакты',
    description: 'Здесь можно вывести телефоны, соцсети, мессенджеры и форму обратной связи.'
  }
};

export function UtilityPage({ type }: UtilityPageProps) {
  const content = contentMap[type];

  return (
    <div className="page-stack">
      <PageHeader title={content.title} subtitle={content.description} showBack />

      <section className="card card--placeholder">
        <div className="placeholder-state">
          <span className="placeholder-state__badge">Технический раздел</span>
          <h2>{content.title}</h2>
          <p>
            Страница уже создана в структуре приложения, поэтому её можно дорабатывать отдельно,
            не ломая основную архитектуру.
          </p>
          <div className="placeholder-state__actions">
            <Link className="button button--primary" to="/">
              На главную
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
