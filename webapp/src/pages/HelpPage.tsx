import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { helpFaq, supportQuickLinks } from '../data/supportContent';

export function HelpPage() {
  return (
    <div className="page-stack utility-page utility-page--help">
      <PageHeader
        title="Помощь"
        subtitle="FAQ, быстрые подсказки по использованию guide и понятные переходы в важные разделы приложения."
        badgeLabel="Support"
      />

      <section className="panel utility-hero-card">
        <div>
          <span className="eyebrow">Guide help</span>
          <h2>Как пользоваться приложением без лишних поисков</h2>
          <p>
            Здесь собраны короткие ответы по избранному, nearby, карточкам мест, офлайн-режиму
            и маршрутам. Это уже не пустая техническая страница, а живой help-раздел.
          </p>
        </div>
        <div className="utility-hero-card__actions">
          <Link className="button button--primary" to="/search">
            Открыть поиск
          </Link>
          <Link className="button button--ghost" to="/contacts">
            Связаться с поддержкой
          </Link>
        </div>
      </section>

      <section className="utility-grid utility-grid--links">
        {supportQuickLinks.map((item) => (
          <Link key={item.id} to={item.path} className="panel utility-link-card">
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <span>Открыть раздел</span>
          </Link>
        ))}
      </section>

      <section className="utility-faq-stack">
        {helpFaq.map((item) => (
          <details key={item.id} className="panel faq-item" open={item.id === 'how-to-use'}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
