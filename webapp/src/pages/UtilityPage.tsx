import { PageHeader } from '../components/layout/PageHeader';

type UtilityPageProps = {
  type: 'help';
};

export function UtilityPage({ type }: UtilityPageProps) {
  if (type !== 'help') {
    return null;
  }

  return (
    <div className="page-stack">
      <PageHeader title="Помощь" subtitle="Контакты отдельно добавим позже, как ты и попросил. Пока оставил полезный раздел помощи и FAQ." showBack />
      <section className="panel faq-list">
        <article>
          <strong>Как управлять контентом?</strong>
          <p>Через скрытую owner-ссылку. Там уже есть серверная сессия, CRUD карточек, загрузка фото и управление главной.</p>
        </article>
        <article>
          <strong>Почему часть данных локально не хранится?</strong>
          <p>Потому что контент переведён на серверную схему: Railway + PostgreSQL и файловое хранилище изображений.</p>
        </article>
        <article>
          <strong>Когда будет геопозиция?</strong>
          <p>Позже, отдельным этапом. Архитектура под это уже подготовлена, но сейчас модуль специально не включён.</p>
        </article>
      </section>
    </div>
  );
}
