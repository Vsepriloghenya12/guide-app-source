import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { getCategoryTone } from '../components/home/homeVisuals';
import { stayPrograms } from '../data/programs';
import { useGuideContent } from '../hooks/useGuideContent';
import { usePageMeta } from '../hooks/usePageMeta';
import { recordGuideAnalytics } from '../utils/analytics';
import type { GuideCategory, GuideCollection } from '../types';

export function ProgramsPage() {
  usePageMeta({
    title: 'Готовые программы',
    description: 'Выберите длительность отдыха и откройте готовые сценарии для отпуска в Дананге.'
  });

  const { categories, collections } = useGuideContent();
  const [selectedProgramId, setSelectedProgramId] = useState(stayPrograms[1]?.id ?? stayPrograms[0].id);

  const activeCategories = categories.filter((category) => category.visible);
  const activeCollections = collections.filter((collection) => collection.active);
  const selectedProgram = stayPrograms.find((program) => program.id === selectedProgramId) ?? stayPrograms[0];
  const recommendedCategories = selectedProgram.categoryIds
    .map((id) => activeCategories.find((category) => category.id === id))
    .filter((category): category is GuideCategory => Boolean(category));
  const recommendedCollections = selectedProgram.collectionIds
    .map((id) => activeCollections.find((collection) => collection.id === id))
    .filter((collection): collection is GuideCollection => Boolean(collection));
  const visibleCollections = recommendedCollections.length > 0 ? recommendedCollections : activeCollections.slice(0, 2);

  return (
    <div className="page-stack utility-page travel-page travel-page--programs">
      <PageHeader
        title="Готовые программы"
        subtitle="Выбери, сколько дней ты отдыхаешь, и открой подходящий ритм поездки."
        showBack
        badgeLabel="Программы"
      />

      <section className="travel-section travel-section--programs-intro">
        <div className="travel-program-hero" data-tone={selectedProgram.tone}>
          <span className="travel-program-hero__eyebrow">План отдыха</span>
          <h2>Сценарии поездки под разную длительность отпуска</h2>
          <p>
            На этой странице можно быстро выбрать ритм отдыха и перейти в самые подходящие разделы,
            не собирая маршрут вручную с нуля.
          </p>
        </div>
      </section>

      <section className="travel-section travel-section--programs-options">
        <div className="travel-program-option-grid" role="tablist" aria-label="Длительность отдыха">
          {stayPrograms.map((program) => {
            const isActive = program.id === selectedProgram.id;

            return (
              <button
                key={program.id}
                type="button"
                className={`travel-program-option${isActive ? ' is-active' : ''}`}
                data-tone={program.tone}
                onClick={() => setSelectedProgramId(program.id)}
                role="tab"
                aria-selected={isActive}
              >
                <span className="travel-program-option__duration">{program.stayLabel}</span>
                <strong>{program.title}</strong>
                <span>{program.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="travel-section travel-section--programs-detail">
        <div className="travel-program-detail-card" data-tone={selectedProgram.tone}>
          <span className="travel-program-detail-card__eyebrow">{selectedProgram.stayLabel}</span>
          <h2>{selectedProgram.title}</h2>
          <p>{selectedProgram.description}</p>

          <div className="travel-program-highlight-row" aria-label="Акценты программы">
            {selectedProgram.highlights.map((highlight) => (
              <span key={highlight} className="travel-program-highlight">
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </section>

      {recommendedCategories.length > 0 ? (
        <section className="travel-section travel-section--programs-categories">
          <div className="travel-section__header travel-section__header--home">
            <h2>Что открыть в первую очередь</h2>
          </div>

          <div className="travel-program-category-grid">
            {recommendedCategories.map((category) => (
              <Link
                key={category.id}
                to={category.path}
                className="travel-program-category-card"
                data-tone={getCategoryTone(category)}
                onClick={() =>
                  recordGuideAnalytics({
                    kind: 'category-click',
                    label: category.title,
                    path: category.path,
                    entityId: category.id,
                    categoryId: category.id
                  })
                }
              >
                <span className="travel-program-category-card__title">{category.shortTitle || category.title}</span>
                {category.description ? <span className="travel-program-category-card__text">{category.description}</span> : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {visibleCollections.length > 0 ? (
        <section className="travel-section travel-section--programs-collections">
          <div className="travel-section__header travel-section__header--home">
            <h2>Готовые идеи на старт</h2>
          </div>

          <div className="travel-story-list travel-story-list--plain">
            {visibleCollections.map((collection) => (
              <Link key={collection.id} to={collection.linkPath} className="travel-story-row" data-tone={selectedProgram.tone}>
                <span
                  className="travel-story-row__thumb"
                  style={{
                    backgroundImage: collection.imageSrc
                      ? `url(${collection.imageSrc})`
                      : 'url(/home-hero-background.png)'
                  }}
                  aria-hidden="true"
                />
                <span className="travel-story-row__body">
                  <span className="travel-story-row__eyebrow">Программа</span>
                  <strong>{collection.title}</strong>
                  <span>{collection.description}</span>
                </span>
                <span className="travel-story-row__arrow" aria-hidden="true">
                  ›
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
