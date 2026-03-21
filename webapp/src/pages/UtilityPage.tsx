import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';

type UtilityPageProps = {
  type: 'search' | 'favorites' | 'nearby' | 'help' | 'contacts';
};

const contentMap: Record<UtilityPageProps['type'], { title: string; description: string }> = {
  search: {
    title: 'Поиск',
    description: 'Здесь можно искать места по категориям, тегам и названиям.'
  },
  favorites: {
    title: 'Избранное',
    description: 'Здесь собраны места, которые ты сохранил для себя.'
  },
  nearby: {
    title: 'Рядом',
    description: 'Этот раздел помогает быстро найти места рядом с тобой.'
  },
  help: {
    title: 'Помощь',
    description: 'Здесь собраны ответы на частые вопросы и полезные подсказки.'
  },
  contacts: {
    title: 'Контакты',
    description: 'Здесь собраны телефоны, мессенджеры и другие способы связи.'
  }
};

export function UtilityPage({ type }: UtilityPageProps) {
  const content = contentMap[type];

  return (
    <div className="page-stack">
      <PageHeader title={content.title} subtitle={content.description} showBack />

      <section className="card card--placeholder">
        <div className="placeholder-state">
          <span className="placeholder-state__badge">Полезный раздел</span>
          <h2>{content.title}</h2>
          <p>
            Раздел помогает быстро перейти к нужным сценариям и важной информации.
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
