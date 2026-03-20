import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { AppLogo } from '../components/common/AppLogo';
import { PageHeader } from '../components/layout/PageHeader';
import { accentClassMap } from '../data/categories';
import type { Banner, Category, Collection } from '../types';

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .bootstrap()
      .then((response) => {
        if (!active) return;
        setCategories(response.categories);
        setCollections(response.collections);
        setBanners(response.banners);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const popular = useMemo(
    () => collections.find((item) => item.slug === 'popular')?.items ?? [],
    [collections]
  );
  const curatedCategories = useMemo(
    () => collections.find((item) => item.slug === 'categories')?.items ?? [],
    [collections]
  );
  const tips = useMemo(() => collections.find((item) => item.slug === 'tips')?.items ?? [], [collections]);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-panel__brand">
          <AppLogo className="hero-panel__logo" alt="Guide Da Nang" />
          <div>
            <p className="hero-panel__eyebrow">Guide Da Nang</p>
            <h1>Рабочий гид с нормальной CMS и красивыми категориями</h1>
            <p>
              Главная теперь собирается из серверных данных: баннеров, подборок, категорий и советов.
            </p>
          </div>
        </div>

        <div className="hero-panel__actions">
          <Link className="button" to="/category/restaurants">
            Открыть места
          </Link>
          <Link className="button button--ghost" to="/search">
            Глобальный поиск
          </Link>
        </div>
      </section>

      {loading ? <div className="panel page-loader">Загружаю главную страницу…</div> : null}

      {banners.length > 0 ? (
        <section className="banner-grid">
          {banners.map((banner) => (
            <Link key={banner.id} to={banner.linkPath} className="banner-card panel">
              <img src={banner.imageUrl || '/danang-home-poster.png'} alt={banner.title} loading="lazy" />
              <div className="banner-card__overlay" />
              <div className="banner-card__content">
                {banner.badge ? <span className="pill">{banner.badge}</span> : null}
                <strong>{banner.title}</strong>
                <p>{banner.subtitle}</p>
              </div>
            </Link>
          ))}
        </section>
      ) : null}

      <section className="home-layout">
        <div className="panel home-column">
          <PageHeader title="Популярное" subtitle="Подборка выводится из owner-CMS." badgeLabel="Коллекция" />
          <div className="popular-grid">
            {popular.map((item) => (
              <Link key={item.id} to={item.listingSlug ? `/place/${item.listingSlug}` : item.path || '/'} className="mini-poster">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel home-column">
          <PageHeader title="Категории" subtitle="Сделал более красивые входы без примитивных иконок." badgeLabel="Навигация" />
          <div className="category-hero-grid">
            {(curatedCategories.length > 0 ? curatedCategories : categories.slice(0, 6).map((category) => ({
              id: category.slug,
              collectionSlug: 'categories',
              itemType: 'category' as const,
              categorySlug: category.slug,
              title: category.shortTitle,
              description: category.description,
              icon: category.icon,
              sortOrder: category.sortOrder
            }))).map((item) => {
              const category = categories.find((entry) => entry.slug === item.categorySlug);
              const accentClass = accentClassMap[category?.accent || 'orange'] || 'is-orange';
              return (
                <Link key={item.id} to={`/category/${item.categorySlug}`} className={`category-hero-tile ${accentClass}`}>
                  <span className="category-hero-tile__icon">{item.icon || category?.icon || '✨'}</span>
                  <div>
                    <strong>{item.title || category?.shortTitle}</strong>
                    <span>{item.description || category?.description}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="panel home-column">
          <PageHeader title="Советы" subtitle="Текстовые блоки тоже управляются отдельно." badgeLabel="Контент" />
          <div className="tips-column">
            {tips.map((tip) => (
              <Link key={tip.id} to={tip.path || '/'} className="tip-card">
                <strong>{tip.title}</strong>
                <p>{tip.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <PageHeader title="Все разделы" subtitle="Каждая категория ведёт на свою страницу с собственными фильтрами и карточками." badgeLabel="Каталог" />
        <div className="all-categories-grid">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/category/${category.slug}`}
              className={`all-category-card ${accentClassMap[category.accent] || 'is-orange'}`}
            >
              <span className="all-category-card__icon">{category.icon}</span>
              <div>
                <strong>{category.title}</strong>
                <span>{category.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
