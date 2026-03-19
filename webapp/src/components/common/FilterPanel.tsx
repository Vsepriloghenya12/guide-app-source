import { PropsWithChildren, useState } from 'react';

type FilterPanelProps = PropsWithChildren<{
  title: string;
}>;

export function FilterPanel({ title, children }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="card card--blur filter-panel">
      <button
        className="filter-panel__toggle"
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
      >
        <span>
          <strong>{title}</strong>
          <small>{isOpen ? 'Скрыть параметры' : 'Показать параметры'}</small>
        </span>
        <span className={`filter-panel__chevron${isOpen ? ' is-open' : ''}`}>⌄</span>
      </button>

      {isOpen ? <div className="filter-panel__body">{children}</div> : null}
    </section>
  );
}
