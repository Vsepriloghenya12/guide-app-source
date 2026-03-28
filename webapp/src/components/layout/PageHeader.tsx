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
    <header className="travel-topbar">
      <div className="travel-topbar__inner">
        {showBack ? (
          <Link className="travel-topbar__button" to="/" aria-label="Назад">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.7 5.3a1 1 0 0 1 0 1.4L9.41 12l5.3 5.3a1 1 0 0 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.41 0Z" fill="currentColor"/>
            </svg>
          </Link>
        ) : (
          <span className="travel-topbar__badge">{badgeLabel}</span>
        )}

        <div className="travel-topbar__titles">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        {actionLabel && actionPath ? (
          <Link className="travel-topbar__button travel-topbar__button--action" to={actionPath} aria-label={actionLabel}>
            <span>{actionLabel}</span>
          </Link>
        ) : (
          <span className="travel-topbar__button travel-topbar__button--ghost" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1.6" fill="currentColor" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" />
              <circle cx="19" cy="12" r="1.6" fill="currentColor" />
            </svg>
          </span>
        )}
      </div>
    </header>
  );
}
