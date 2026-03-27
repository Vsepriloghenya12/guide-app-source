import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

type FilterPanelProps = PropsWithChildren<{
  title: string;
  triggerLabel?: string;
  summary?: string;
  activeCount?: number;
  quickActions?: ReactNode;
  onReset?: () => void;
}>;

export function FilterPanel({
  title,
  triggerLabel = 'Фильтр',
  summary,
  activeCount = 0,
  quickActions,
  onReset,
  children
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <section className="filter-panel-shell">
      {quickActions ? <div className="filter-panel-shell__chips">{quickActions}</div> : null}

      <div className="filter-launcher">
        <div className="filter-launcher__meta">
          <strong>{title}</strong>
          {summary ? <span>{summary}</span> : null}
        </div>

        <div className="filter-launcher__actions">
          {onReset && activeCount > 0 ? (
            <button className="button button--ghost button--small" type="button" onClick={onReset}>
              Сбросить
            </button>
          ) : null}
          <button className="button button--ghost filter-launcher__button" type="button" onClick={() => setIsOpen(true)}>
            {triggerLabel}
            {activeCount > 0 ? <span className="filter-launcher__badge">{activeCount}</span> : null}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsOpen(false)}>
          <section
            className="modal-window filter-modal"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-window__header">
              <div>
                <strong>{title}</strong>
                {summary ? <small>{summary}</small> : null}
              </div>
              <div className="modal-window__header-actions">
                {onReset && activeCount > 0 ? (
                  <button className="button button--ghost button--small" type="button" onClick={onReset}>
                    Сбросить всё
                  </button>
                ) : null}
                <button className="modal-window__close" type="button" onClick={() => setIsOpen(false)}>
                  ✕
                </button>
              </div>
            </div>

            <div className="modal-window__body">{children}</div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
