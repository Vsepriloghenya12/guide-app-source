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
  badgeLabel = 'Guide'
}: PageHeaderProps) {
  return (
    <header className="page-header card card--blur">
      <div className="page-header__top">
        {showBack ? (
          <Link className="chip-link" to="/">
            ← Назад
          </Link>
        ) : (
          <span className="chip-link chip-link--ghost">{badgeLabel}</span>
        )}

        {actionLabel && actionPath ? (
          <Link className="chip-link" to={actionPath}>
            {actionLabel}
          </Link>
        ) : null}
      </div>

      <div className="page-header__content">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </header>
  );
}
