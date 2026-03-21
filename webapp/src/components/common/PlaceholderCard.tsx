import { useEffect, useMemo, useState } from 'react';

type PlaceholderCardProps = {
  title: string;
  address: string;
  description: string;
  rating: number;
  imageLabel: string;
  imageSrc?: string;
  imageSources?: string[];
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
  imageSources,
  meta,
  phone,
  website,
  hours,
  top
}: PlaceholderCardProps) {
  const gallery = useMemo(() => {
    const normalized = (imageSources ?? []).filter(Boolean);
    if (normalized.length > 0) {
      return normalized;
    }
    return imageSrc ? [imageSrc] : [];
  }, [imageSources, imageSrc]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [gallery.length, title]);

  const hasGallery = gallery.length > 0;
  const activeImage = hasGallery ? gallery[activeImageIndex] : undefined;

  const showPrevImage = () => {
    if (gallery.length < 2) {
      return;
    }
    setActiveImageIndex((current) => (current - 1 + gallery.length) % gallery.length);
  };

  const showNextImage = () => {
    if (gallery.length < 2) {
      return;
    }
    setActiveImageIndex((current) => (current + 1) % gallery.length);
  };

  return (
    <article className="place-card card card--interactive">
      <div
        className="place-card__media"
        style={activeImage ? { backgroundImage: `url(${activeImage})` } : undefined}
      >
        {!activeImage ? <span>{imageLabel}</span> : null}
        {top ? <span className="place-card__top-badge">Топ</span> : null}
        {gallery.length > 1 ? (
          <>
            <div className="place-card__gallery-controls">
              <button className="place-card__gallery-button" type="button" onClick={showPrevImage} aria-label="Предыдущее фото">
                ‹
              </button>
              <button className="place-card__gallery-button" type="button" onClick={showNextImage} aria-label="Следующее фото">
                ›
              </button>
            </div>
            <div className="place-card__gallery-indicators" aria-label="Индикаторы карусели">
              {gallery.map((_, index) => (
                <button
                  key={`${title}-${index}`}
                  type="button"
                  className={`place-card__gallery-dot ${index === activeImageIndex ? 'is-active' : ''}`}
                  aria-label={`Фото ${index + 1}`}
                  onClick={() => setActiveImageIndex(index)}
                />
              ))}
            </div>
          </>
        ) : null}
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
