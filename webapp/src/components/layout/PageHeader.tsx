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
    <header className="page-header travel-header">
      <div className="travel-header__bar">
        {showBack ? (
          <Link className="travel-header__icon" to="/" aria-label="Назад на главную">
            ←
          </Link>
        ) : (
          <span className="travel-header__badge">{badgeLabel}</span>
        )}

        <div className="travel-header__titles">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        {actionLabel && actionPath ? (
          <Link className="travel-header__action" to={actionPath}>
            {actionLabel}
          </Link>
        ) : (
          <span className="travel-header__spacer" aria-hidden="true" />
        )}
      </div>
    </header>
  );
}
