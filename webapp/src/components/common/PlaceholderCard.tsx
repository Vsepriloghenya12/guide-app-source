type PlaceholderCardProps = {
  title: string;
  address: string;
  description: string;
  rating: number;
  imageLabel: string;
  meta: string[];
};

export function PlaceholderCard({
  title,
  address,
  description,
  rating,
  imageLabel,
  meta
}: PlaceholderCardProps) {
  return (
    <article className="place-card card card--interactive">
      <div className="place-card__media">
        <span>{imageLabel}</span>
      </div>

      <div className="place-card__body">
        <div className="place-card__topline">
          <h3>{title}</h3>
          <span className="place-card__rating">★ {rating.toFixed(1)}</span>
        </div>

        <p className="place-card__address">{address}</p>
        <p className="place-card__description">{description}</p>

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
