import { Link } from 'react-router-dom';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actionLabel?: string;
  actionPath?: string;
  badgeLabel?: string;
};

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  actionLabel,
  actionPath,
  badgeLabel = 'Danang Guide'
}: PageHeaderProps) {
  return (
    <header className="page-header reference-header">
      <div className="reference-header__bar">
        {showBack ? (
          <Link className="reference-header__nav reference-header__nav--back" to="/" aria-label="Назад на главную">
            ‹
          </Link>
        ) : (
          <span className="reference-header__brand">{badgeLabel}</span>
        )}

        <div className="reference-header__titles">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        {actionLabel && actionPath ? (
          <Link className="reference-header__nav reference-header__nav--action" to={actionPath}>
            {actionLabel}
          </Link>
        ) : (
          <span className="reference-header__nav reference-header__nav--ghost" aria-hidden="true">
            •••
          </span>
        )}
      </div>
    </header>
  );
}
