import { PropsWithChildren, useEffect, useState } from 'react';

type FilterPanelProps = PropsWithChildren<{
  title: string;
  activeCount?: number;
}>;

export function FilterPanel({ title, activeCount = 0, children }: FilterPanelProps) {
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
    <>
      <div className="filter-launcher">
        <button className="button button--ghost filter-launcher__button" type="button" onClick={() => setIsOpen(true)}>
          Фильтр{activeCount > 0 ? ` · ${activeCount}` : ''}
        </button>
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
              <strong>{title}</strong>
              <button className="modal-window__close" type="button" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-window__body">{children}</div>
          </section>
        </div>
      ) : null}
    </>
  );
}
