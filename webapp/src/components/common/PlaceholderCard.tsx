type PlaceholderCardProps = {
  title: string;
  address: string;
  description: string;
  rating: number;
  imageLabel: string;
  imageSrc?: string;
  meta: string[];
  phone?: string;
  website?: string;
  hours?: string;
  top?: boolean;
};

export function PlaceholderCard({
  title,
  address,
  description,
  rating,
  imageLabel,
  imageSrc,
  meta,
  phone,
  website,
  hours,
  top
}: PlaceholderCardProps) {
  return (
    <article className="place-card card card--interactive">
      <div className="place-card__media" style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : undefined}>
        {!imageSrc ? <span>{imageLabel}</span> : null}
        {top ? <span className="place-card__top-badge">Топ</span> : null}
      </div>

      <div className="place-card__body">
        <div className="place-card__topline">
          <h3>{title}</h3>
          <span className="place-card__rating">★ {rating.toFixed(1)}</span>
        </div>

        <p className="place-card__address">{address}</p>
        <p className="place-card__description">{description}</p>

        {phone || website || hours ? (
          <div className="place-card__contacts">
            {hours ? <p>Часы: {hours}</p> : null}
            {phone ? <p>Телефон: {phone}</p> : null}
            {website ? (
              <p>
                Сайт:{' '}
                <a href={website} target="_blank" rel="noreferrer">
                  {website}
                </a>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="place-card__tags">
          {meta.map((tag) => (
            <span key={tag} className="place-card__tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
