import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { PageHeader } from '../components/layout/PageHeader';
import type { Banner, Category, Collection, CollectionItem, Listing } from '../types';

type ListingDraft = Partial<Listing> & {
  categorySlug: string;
  title: string;
};

const emptyListingDraft = (): ListingDraft => ({
  categorySlug: 'restaurants',
  title: '',
  shortDescription: '',
  description: '',
  address: '',
  phone: '',
  website: '',
  hours: '',
  mapQuery: '',
  averagePrice: null,
  priceLabel: '',
  rating: 4.7,
  listingType: '',
  cuisine: '',
  services: [],
  tags: [],
  features: [],
  childFriendly: false,
  petFriendly: false,
  status: 'draft',
  sortOrder: 100,
  featured: false,
  imageUrls: [],
  extra: {}
});

function arrayToText(value?: string[]) {
  return value?.join(', ') || '';
}

function parseList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function serializeExtra(extra?: Listing['extra']) {
  return JSON.stringify(extra || {}, null, 2);
}

export function OwnerPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [draft, setDraft] = useState<ListingDraft>(emptyListingDraft());
  const [draftServices, setDraftServices] = useState('');
  const [draftTags, setDraftTags] = useState('');
  const [draftFeatures, setDraftFeatures] = useState('');
  const [draftImages, setDraftImages] = useState('');
  const [draftExtra, setDraftExtra] = useState('{}');
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .ownerBootstrap()
      .then((response) => {
        if (!active) return;
        setCategories(response.categories);
        setListings(response.listings);
        setCollections(response.collections);
        setBanners(response.banners);
        setDraft((current) => ({ ...current, categorySlug: response.categories[0]?.slug || 'restaurants' }));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleListings = useMemo(
    () =>
      listings
        .filter((item) => (activeCategory === 'all' ? true : item.categorySlug === activeCategory))
        .sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
          return a.title.localeCompare(b.title, 'ru');
        }),
    [listings, activeCategory]
  );

  const startEdit = (listing: Listing) => {
    setDraft(listing);
    setDraftServices(arrayToText(listing.services));
    setDraftTags(arrayToText(listing.tags));
    setDraftFeatures(arrayToText(listing.features));
    setDraftImages(arrayToText(listing.imageUrls));
    setDraftExtra(serializeExtra(listing.extra));
    setStatusMessage(`Редактирование: ${listing.title}`);
  };

  const resetDraft = () => {
    setDraft({ ...emptyListingDraft(), categorySlug: categories[0]?.slug || 'restaurants' });
    setDraftServices('');
    setDraftTags('');
    setDraftFeatures('');
    setDraftImages('');
    setDraftExtra('{}');
    setStatusMessage('');
  };

  const saveListing = async () => {
    try {
      const payload: ListingDraft = {
        ...draft,
        services: parseList(draftServices),
        tags: parseList(draftTags),
        features: parseList(draftFeatures),
        imageUrls: parseList(draftImages),
        extra: JSON.parse(draftExtra || '{}')
      };
      const response = await api.saveListing(payload as ListingDraft & Pick<Listing, 'categorySlug' | 'title'>);
      setListings((current) => {
        const exists = current.some((item) => item.id === response.listing.id);
        return exists
          ? current.map((item) => (item.id === response.listing.id ? response.listing : item))
          : [response.listing, ...current];
      });
      setStatusMessage(`Сохранено: ${response.listing.title}`);
      resetDraft();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось сохранить карточку');
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await api.uploadImage(file);
      const list = parseList(draftImages);
      setDraftImages([...list, response.url].join(', '));
      setStatusMessage('Изображение загружено и сжато на сервере.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Ошибка загрузки изображения');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeListing = async (id: string) => {
    await api.deleteListing(id);
    setListings((current) => current.filter((item) => item.id !== id));
    if (draft.id === id) resetDraft();
    setStatusMessage('Карточка удалена.');
  };

  const saveCollection = async (collectionSlug: string, items: CollectionItem[]) => {
    await api.saveCollectionItems(
      collectionSlug,
      items.map((item) => ({
        id: item.id,
        itemType: item.itemType,
        listingSlug: item.listingSlug,
        categorySlug: item.categorySlug,
        title: item.title,
        description: item.description,
        path: item.path,
        imageUrl: item.imageUrl,
        icon: item.icon,
        sortOrder: item.sortOrder
      }))
    );
    setStatusMessage(`Коллекция ${collectionSlug} сохранена.`);
  };

  const saveBannerList = async () => {
    await api.saveBanners(banners);
    setStatusMessage('Баннеры главной сохранены.');
  };

  const updateCollectionItem = (collectionSlug: string, itemId: string, patch: Partial<CollectionItem>) => {
    setCollections((current) =>
      current.map((collection) =>
        collection.slug !== collectionSlug
          ? collection
          : {
              ...collection,
              items: collection.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
            }
      )
    );
  };

  const addCollectionItem = (collectionSlug: string, itemType: CollectionItem['itemType']) => {
    setCollections((current) =>
      current.map((collection) =>
        collection.slug !== collectionSlug
          ? collection
          : {
              ...collection,
              items: [
                ...collection.items,
                {
                  id: crypto.randomUUID(),
                  collectionSlug,
                  itemType,
                  title: '',
                  description: '',
                  sortOrder: (collection.items.length + 1) * 10
                }
              ]
            }
      )
    );
  };

  const removeCollectionItem = (collectionSlug: string, itemId: string) => {
    setCollections((current) =>
      current.map((collection) =>
        collection.slug !== collectionSlug
          ? collection
          : { ...collection, items: collection.items.filter((item) => item.id !== itemId) }
      )
    );
  };

  const logout = async () => {
    await api.ownerLogout();
    navigate('/owner-login', { replace: true });
  };

  if (loading) {
    return <div className="panel page-loader">Загружаю owner-CMS…</div>;
  }

  return (
    <div className="page-stack owner-page">
      <PageHeader
        title="Owner CMS"
        subtitle="Серверная CMS: PostgreSQL, статусы карточек, сортировка, приоритет, баннеры, подборки и загрузка фото."
        badgeLabel="Protected"
      />

      <section className="panel owner-summary-grid">
        <article><strong>{categories.length}</strong><span>категорий</span></article>
        <article><strong>{listings.length}</strong><span>карточек</span></article>
        <article><strong>{banners.length}</strong><span>баннеров</span></article>
        <article><strong>{collections.length}</strong><span>контентных блоков</span></article>
        <button className="button button--ghost" type="button" onClick={logout}>Выйти</button>
      </section>

      {statusMessage ? <div className="panel status-panel">{statusMessage}</div> : null}

      <section className="owner-layout">
        <div className="panel owner-form-panel">
          <div className="section-headline">
            <strong>{draft.id ? 'Редактирование карточки' : 'Новая карточка'}</strong>
            <button className="button button--ghost" type="button" onClick={resetDraft}>Очистить</button>
          </div>

          <div className="owner-form-grid">
            <label className="field">
              <span>Категория</span>
              <select value={draft.categorySlug} onChange={(event) => setDraft((current) => ({ ...current, categorySlug: event.target.value }))}>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>{category.title}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Статус</span>
              <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as Listing['status'] }))}>
                <option value="published">Опубликовано</option>
                <option value="hidden">Скрыто</option>
                <option value="draft">Черновик</option>
              </select>
            </label>

            <label className="field field--grow owner-form-grid__full">
              <span>Название</span>
              <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
            </label>

            <label className="field field--grow owner-form-grid__full">
              <span>Короткое описание</span>
              <input value={draft.shortDescription || ''} onChange={(event) => setDraft((current) => ({ ...current, shortDescription: event.target.value }))} />
            </label>

            <label className="field field--grow owner-form-grid__full">
              <span>Полное описание</span>
              <textarea rows={4} value={draft.description || ''} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
            </label>

            <label className="field field--grow owner-form-grid__full">
              <span>Адрес</span>
              <input value={draft.address || ''} onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))} />
            </label>

            <label className="field"><span>Телефон</span><input value={draft.phone || ''} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} /></label>
            <label className="field"><span>Сайт</span><input value={draft.website || ''} onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))} /></label>
            <label className="field"><span>Часы работы</span><input value={draft.hours || ''} onChange={(event) => setDraft((current) => ({ ...current, hours: event.target.value }))} /></label>
            <label className="field"><span>Тип</span><input value={draft.listingType || ''} onChange={(event) => setDraft((current) => ({ ...current, listingType: event.target.value }))} placeholder="restaurant / spa / concert" /></label>
            <label className="field"><span>Кухня / подтип</span><input value={draft.cuisine || ''} onChange={(event) => setDraft((current) => ({ ...current, cuisine: event.target.value }))} /></label>
            <label className="field"><span>Рейтинг</span><input type="number" step="0.1" min="0" max="5" value={draft.rating || 0} onChange={(event) => setDraft((current) => ({ ...current, rating: Number(event.target.value) }))} /></label>
            <label className="field"><span>Приоритет</span><input type="number" value={draft.sortOrder || 100} onChange={(event) => setDraft((current) => ({ ...current, sortOrder: Number(event.target.value) }))} /></label>
            <label className="field"><span>Средняя стоимость</span><input type="number" value={draft.averagePrice ?? ''} onChange={(event) => setDraft((current) => ({ ...current, averagePrice: event.target.value ? Number(event.target.value) : null }))} /></label>
            <label className="field"><span>Текст цены</span><input value={draft.priceLabel || ''} onChange={(event) => setDraft((current) => ({ ...current, priceLabel: event.target.value }))} placeholder="От 900k VND" /></label>

            <label className="field field--grow owner-form-grid__full"><span>Услуги</span><input value={draftServices} onChange={(event) => setDraftServices(event.target.value)} placeholder="massage, spa, breakfast" /></label>
            <label className="field field--grow owner-form-grid__full"><span>Теги</span><input value={draftTags} onChange={(event) => setDraftTags(event.target.value)} placeholder="sea-view, family, romantic" /></label>
            <label className="field field--grow owner-form-grid__full"><span>Особенности</span><input value={draftFeatures} onChange={(event) => setDraftFeatures(event.target.value)} placeholder="wifi, live-music" /></label>
            <label className="field field--grow owner-form-grid__full"><span>URL изображений</span><textarea rows={3} value={draftImages} onChange={(event) => setDraftImages(event.target.value)} placeholder="/uploads/....jpg, https://..." /></label>

            <div className="field field--grow owner-form-grid__full">
              <span>Загрузка фото</span>
              <input type="file" accept="image/*" onChange={handleUpload} />
              <small>{uploading ? 'Загрузка и сжатие…' : 'Изображение автоматически сжимается сервером.'}</small>
            </div>

            <label className="field field--grow owner-form-grid__full"><span>Extra JSON</span><textarea rows={5} value={draftExtra} onChange={(event) => setDraftExtra(event.target.value)} placeholder='{"date":"2026-03-21","time":"19:00"}' /></label>

            <label className="toggle-row"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => setDraft((current) => ({ ...current, featured: event.target.checked }))} /><span>Показывать в топе</span></label>
            <label className="toggle-row"><input type="checkbox" checked={Boolean(draft.childFriendly)} onChange={(event) => setDraft((current) => ({ ...current, childFriendly: event.target.checked }))} /><span>Можно с детьми</span></label>
            <label className="toggle-row"><input type="checkbox" checked={Boolean(draft.petFriendly)} onChange={(event) => setDraft((current) => ({ ...current, petFriendly: event.target.checked }))} /><span>Можно с животными</span></label>
          </div>

          <button className="button" type="button" onClick={saveListing}>Сохранить карточку</button>
        </div>

        <div className="panel owner-list-panel">
          <div className="section-headline">
            <strong>Карточки</strong>
            <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}>
              <option value="all">Все категории</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>{category.title}</option>
              ))}
            </select>
          </div>
          <div className="owner-item-list">
            {visibleListings.map((item) => (
              <article key={item.id} className="owner-item-card">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.categorySlug} · {item.status} · priority {item.sortOrder}</p>
                </div>
                <div className="chip-row">
                  <button className="button button--ghost" type="button" onClick={() => startEdit(item)}>Редактировать</button>
                  <button className="button button--ghost" type="button" onClick={() => removeListing(item.id)}>Удалить</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-headline">
          <strong>Баннеры главной</strong>
          <button className="button button--ghost" type="button" onClick={() => setBanners((current) => [...current, { id: crypto.randomUUID(), title: '', subtitle: '', badge: '', imageUrl: '', linkPath: '/', sortOrder: (current.length + 1) * 10, isActive: true }])}>Добавить баннер</button>
        </div>
        <div className="owner-card-grid">
          {banners.map((banner) => (
            <div key={banner.id} className="owner-mini-card">
              <input value={banner.title} onChange={(event) => setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, title: event.target.value } : item))} placeholder="Заголовок" />
              <input value={banner.subtitle} onChange={(event) => setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, subtitle: event.target.value } : item))} placeholder="Подзаголовок" />
              <input value={banner.badge} onChange={(event) => setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, badge: event.target.value } : item))} placeholder="Badge" />
              <input value={banner.imageUrl} onChange={(event) => setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, imageUrl: event.target.value } : item))} placeholder="URL изображения" />
              <input value={banner.linkPath} onChange={(event) => setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, linkPath: event.target.value } : item))} placeholder="Ссылка" />
              <div className="chip-row">
                <button className="button button--ghost" type="button" onClick={() => setBanners((current) => current.filter((item) => item.id !== banner.id))}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
        <button className="button" type="button" onClick={saveBannerList}>Сохранить баннеры</button>
      </section>

      {collections.map((collection) => (
        <section key={collection.slug} className="panel">
          <div className="section-headline">
            <div>
              <strong>{collection.title}</strong>
              <p>{collection.subtitle}</p>
            </div>
            <div className="chip-row">
              <button className="button button--ghost" type="button" onClick={() => addCollectionItem(collection.slug, collection.kind === 'tips' ? 'tip' : collection.kind === 'categories' ? 'category' : 'listing')}>Добавить элемент</button>
              <button className="button" type="button" onClick={() => saveCollection(collection.slug, collection.items)}>Сохранить блок</button>
            </div>
          </div>
          <div className="owner-card-grid">
            {collection.items.map((item) => (
              <div key={item.id} className="owner-mini-card">
                <input value={item.title} onChange={(event) => updateCollectionItem(collection.slug, item.id, { title: event.target.value })} placeholder="Заголовок" />
                <input value={item.description} onChange={(event) => updateCollectionItem(collection.slug, item.id, { description: event.target.value })} placeholder="Описание" />
                {collection.kind === 'listings' ? (
                  <select value={item.listingSlug || ''} onChange={(event) => updateCollectionItem(collection.slug, item.id, { listingSlug: event.target.value })}>
                    <option value="">Выбрать карточку</option>
                    {listings.filter((listing) => listing.status === 'published').map((listing) => (
                      <option key={listing.id} value={listing.slug}>{listing.title}</option>
                    ))}
                  </select>
                ) : null}
                {collection.kind === 'categories' ? (
                  <select value={item.categorySlug || ''} onChange={(event) => updateCollectionItem(collection.slug, item.id, { categorySlug: event.target.value })}>
                    <option value="">Выбрать категорию</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>{category.title}</option>
                    ))}
                  </select>
                ) : null}
                {collection.kind === 'tips' ? (
                  <input value={item.path || ''} onChange={(event) => updateCollectionItem(collection.slug, item.id, { path: event.target.value })} placeholder="Ссылка /path" />
                ) : null}
                <input value={item.icon || ''} onChange={(event) => updateCollectionItem(collection.slug, item.id, { icon: event.target.value })} placeholder="Иконка/emoji" />
                <button className="button button--ghost" type="button" onClick={() => removeCollectionItem(collection.slug, item.id)}>Удалить</button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
