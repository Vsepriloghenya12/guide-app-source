import { ChangeEvent, FormEvent, useState } from 'react';
import { updateGuideContent } from '../../data/guideContent';
import type { GuideCategory, GuideCollection, GuidePlace, GuideTip, HomeBanner, HomeContent } from '../../types';
import { uploadImageAsset, uploadMediaAsset } from '../../utils/imageUpload';

type OwnerHomeManagerProps = {
  home: HomeContent;
  places: GuidePlace[];
  categories: GuideCategory[];
  tips: GuideTip[];
  banners: HomeBanner[];
  collections: GuideCollection[];
};

type BannerDraft = {
  id?: string;
  title: string;
  subtitle: string;
  linkPath: string;
  tone: HomeBanner['tone'];
  imageSrc: string;
  active: boolean;
};

type CollectionDraft = {
  id?: string;
  title: string;
  description: string;
  linkPath: string;
  imageSrc: string;
  itemIds: string[];
  active: boolean;
};

const initialBannerDraft: BannerDraft = {
  title: '',
  subtitle: '',
  linkPath: '/',
  tone: 'coast',
  imageSrc: '',
  active: true
};

const initialCollectionDraft: CollectionDraft = {
  title: '',
  description: '',
  linkPath: '/',
  imageSrc: '',
  itemIds: [],
  active: true
};

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toggleId(list: string[], id: string, checked: boolean) {
  if (checked) {
    return list.includes(id) ? list : [...list, id];
  }

  return list.filter((item) => item !== id);
}

export function OwnerHomeManager({
  home,
  places,
  categories,
  tips,
  banners,
  collections
}: OwnerHomeManagerProps) {
  const [bannerDraft, setBannerDraft] = useState<BannerDraft>(initialBannerDraft);
  const [collectionDraft, setCollectionDraft] = useState<CollectionDraft>(initialCollectionDraft);
  const [status, setStatus] = useState('');
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [isCollectionUploading, setIsCollectionUploading] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);

  const updateHome = (updater: (homeState: HomeContent) => HomeContent) => {
    updateGuideContent((current) => ({
      ...current,
      home: updater(current.home)
    }));
  };

  const handleSectionTitle = (field: keyof HomeContent['sectionTitles'], value: string) => {
    updateHome((currentHome) => ({
      ...currentHome,
      sectionTitles: {
        ...currentHome.sectionTitles,
        [field]: value
      }
    }));
  };


  const handleLogoMediaField = (field: 'src' | 'posterSrc' | 'alt', value: string) => {
    updateHome((currentHome) => ({
      ...currentHome,
      logoMedia: {
        type: currentHome.logoMedia?.type === 'video' ? 'video' : 'image',
        src: field === 'src' ? value : currentHome.logoMedia?.src || '',
        posterSrc: field === 'posterSrc' ? value : currentHome.logoMedia?.posterSrc || '',
        alt: field === 'alt' ? value : currentHome.logoMedia?.alt || ''
      }
    }));
  };

  const handleLogoMediaType = (value: 'image' | 'video') => {
    updateHome((currentHome) => ({
      ...currentHome,
      logoMedia: currentHome.logoMedia?.src
        ? {
            ...currentHome.logoMedia,
            type: value
          }
        : {
            type: value,
            src: '',
            posterSrc: '',
            alt: ''
          }
    }));
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsLogoUploading(true);
    setStatus('Загружаю лого...');

    try {
      const url = await uploadMediaAsset(file, 'logo', { maxWidth: 1800, maxHeight: 1200, quality: 0.9 });
      const nextType = file.type.startsWith('video/') ? 'video' : 'image';
      updateHome((currentHome) => ({
        ...currentHome,
        logoMedia: {
          type: nextType,
          src: url,
          posterSrc: nextType === 'video' ? currentHome.logoMedia?.posterSrc || '' : '',
          alt: currentHome.logoMedia?.alt || ''
        }
      }));
      setStatus(nextType === 'video' ? 'Видео-логотип загружен.' : 'Логотип загружен.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось загрузить логотип.');
    } finally {
      setIsLogoUploading(false);
      event.target.value = '';
    }
  };

  const clearLogoMedia = () => {
    updateHome((currentHome) => ({
      ...currentHome,
      logoMedia: undefined
    }));
    setStatus('Лого очищено. Будет использоваться файл из public.');
  };


  const handleBannerImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsBannerUploading(true);
    setStatus('Загружаю баннер...');

    try {
      const imageSrc = await uploadImageAsset(file, 'banner', { maxWidth: 1800, maxHeight: 1200, quality: 0.84 });
      setBannerDraft((current) => ({
        ...current,
        imageSrc
      }));
      setStatus('Баннер загружен.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось загрузить баннер.');
    } finally {
      setIsBannerUploading(false);
      event.target.value = '';
    }
  };

  const handleCollectionImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsCollectionUploading(true);
    setStatus('Загружаю изображение подборки...');

    try {
      const imageSrc = await uploadImageAsset(file, 'collection', { maxWidth: 1800, maxHeight: 1200, quality: 0.84 });
      setCollectionDraft((current) => ({
        ...current,
        imageSrc
      }));
      setStatus('Изображение подборки загружено.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось загрузить изображение подборки.');
    } finally {
      setIsCollectionUploading(false);
      event.target.value = '';
    }
  };

  const handleBannerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bannerDraft.title.trim()) {
      setStatus('Заполни заголовок баннера.');
      return;
    }

    const nextBanner: HomeBanner = {
      id: bannerDraft.id || createId('banner'),
      title: bannerDraft.title.trim(),
      subtitle: bannerDraft.subtitle.trim(),
      linkPath: bannerDraft.linkPath.trim() || '/',
      tone: bannerDraft.tone,
      imageSrc: bannerDraft.imageSrc,
      active: bannerDraft.active
    };

    updateGuideContent((current) => ({
      ...current,
      banners: bannerDraft.id
        ? current.banners.map((banner) => (banner.id === bannerDraft.id ? nextBanner : banner))
        : [nextBanner, ...current.banners],
      home: current.home.bannerIds.includes(nextBanner.id)
        ? current.home
        : { ...current.home, bannerIds: [nextBanner.id, ...current.home.bannerIds] }
    }));

    setStatus(bannerDraft.id ? 'Баннер обновлён.' : 'Баннер добавлен.');
    setBannerDraft(initialBannerDraft);
  };

  const handleCollectionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!collectionDraft.title.trim()) {
      setStatus('Заполни название подборки.');
      return;
    }

    const nextCollection: GuideCollection = {
      id: collectionDraft.id || createId('collection'),
      title: collectionDraft.title.trim(),
      description: collectionDraft.description.trim(),
      linkPath: collectionDraft.linkPath.trim() || '/',
      imageSrc: collectionDraft.imageSrc,
      itemIds: collectionDraft.itemIds,
      active: collectionDraft.active
    };

    updateGuideContent((current) => ({
      ...current,
      collections: collectionDraft.id
        ? current.collections.map((collection) =>
            collection.id === collectionDraft.id ? nextCollection : collection
          )
        : [nextCollection, ...current.collections],
      home: current.home.collectionIds.includes(nextCollection.id)
        ? current.home
        : { ...current.home, collectionIds: [nextCollection.id, ...current.home.collectionIds] }
    }));

    setStatus(collectionDraft.id ? 'Подборка обновлена.' : 'Подборка добавлена.');
    setCollectionDraft(initialCollectionDraft);
  };

  const deleteBanner = (id: string) => {
    updateGuideContent((current) => ({
      ...current,
      banners: current.banners.filter((banner) => banner.id !== id),
      home: {
        ...current.home,
        bannerIds: current.home.bannerIds.filter((bannerId) => bannerId !== id)
      }
    }));
    setStatus('Баннер удалён.');
  };

  const deleteCollection = (id: string) => {
    updateGuideContent((current) => ({
      ...current,
      collections: current.collections.filter((collection) => collection.id !== id),
      home: {
        ...current.home,
        collectionIds: current.home.collectionIds.filter((collectionId) => collectionId !== id)
      }
    }));
    setStatus('Подборка удалена.');
  };

  return (
    <section className="owner-cms-section">
      <div className="owner-cms-section__header">
        <div>
          <span className="eyebrow">CMS / главная</span>
          <h2>Управление главной страницей</h2>
          <p>
            Отдельное управление блоками “Популярное”, “Категории”, “Советы”, а также баннерами,
            подборками и заголовками секций.
          </p>
        </div>
      </div>

      <div className="owner-cms-layout owner-cms-layout--stack">
        <div className="owner-editor-card owner-editor-form">
          <div className="owner-editor-form__grid owner-editor-form__grid--double">
            <label className="field">
              <span>Заголовок “Популярное”</span>
              <input
                value={home.sectionTitles.popular}
                onChange={(event) => handleSectionTitle('popular', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Заголовок “Категории”</span>
              <input
                value={home.sectionTitles.categories}
                onChange={(event) => handleSectionTitle('categories', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Заголовок “Советы”</span>
              <input
                value={home.sectionTitles.tips}
                onChange={(event) => handleSectionTitle('tips', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Заголовок “Подборки”</span>
              <input
                value={home.sectionTitles.collections}
                onChange={(event) => handleSectionTitle('collections', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Заголовок списка рубрик</span>
              <input
                value={home.sectionTitles.allCategories}
                onChange={(event) => handleSectionTitle('allCategories', event.target.value)}
              />
            </label>
          </div>

          <div className="owner-editor-form__grid owner-editor-form__grid--double">
            <label className="field">
              <span>Тип логотипа</span>
              <select
                value={home.logoMedia?.type || 'image'}
                onChange={(event) => handleLogoMediaType(event.target.value as 'image' | 'video')}
              >
                <option value="image">Картинка</option>
                <option value="video">Короткое видео</option>
              </select>
            </label>
            <label className="field">
              <span>Alt-текст логотипа</span>
              <input
                value={home.logoMedia?.alt || ''}
                onChange={(event) => handleLogoMediaField('alt', event.target.value)}
                placeholder="Например: Логотип Guide"
              />
            </label>
            <label className="field">
              <span>URL логотипа</span>
              <input
                value={home.logoMedia?.src || ''}
                onChange={(event) => handleLogoMediaField('src', event.target.value)}
                placeholder="/uploads/logo.mp4 или https://..."
              />
            </label>
            <label className="field">
              <span>Poster для видео</span>
              <input
                value={home.logoMedia?.posterSrc || ''}
                onChange={(event) => handleLogoMediaField('posterSrc', event.target.value)}
                placeholder="/uploads/logo-poster.jpg"
                disabled={(home.logoMedia?.type || 'image') !== 'video'}
              />
            </label>
            <label className="field field--file">
              <span>{isLogoUploading ? 'Загрузка логотипа...' : 'Загрузить картинку или короткое видео'}</span>
              <input
                type="file"
                accept="image/*,video/mp4,video/webm,video/quicktime"
                onChange={handleLogoUpload}
                disabled={isLogoUploading}
              />
            </label>
            <div className="owner-editor-form__actions owner-editor-form__actions--inline">
              <button className="button button--ghost" type="button" onClick={clearLogoMedia}>
                Очистить лого
              </button>
            </div>
          </div>

          <div className="owner-inline-card">
            <strong>Логотип на главной</strong>
            <p>Теперь можно использовать не только изображение, но и короткое видео в зоне логотипа.</p>
            {home.logoMedia?.src ? (
              home.logoMedia.type === 'video' ? (
                <video className="owner-media-preview" src={home.logoMedia.src} poster={home.logoMedia.posterSrc || undefined} muted loop controls playsInline />
              ) : (
                <img className="owner-media-preview" src={home.logoMedia.src} alt={home.logoMedia.alt || 'Логотип'} />
              )
            ) : (
              <span className="panel-helper">Если поле пустое, приложение берёт стандартный логотип из public.</span>
            )}
          </div>

          <div className="owner-selection-grid">
            <article className="owner-selection-card">
              <h3>Популярное</h3>
              <div className="checkbox-list">
                {places.map((place) => (
                  <label key={place.id} className="checkbox-pill checkbox-pill--owner checkbox-pill--owner-wide">
                    <input
                      type="checkbox"
                      checked={home.popularPlaceIds.includes(place.id)}
                      onChange={(event) =>
                        updateHome((currentHome) => ({
                          ...currentHome,
                          popularPlaceIds: toggleId(
                            currentHome.popularPlaceIds,
                            place.id,
                            event.target.checked
                          )
                        }))
                      }
                    />
                    <span>{place.title}</span>
                  </label>
                ))}
              </div>
            </article>

            <article className="owner-selection-card">
              <h3>Категории на главной</h3>
              <div className="checkbox-list">
                {categories.map((category) => (
                  <label key={category.id} className="checkbox-pill checkbox-pill--owner checkbox-pill--owner-wide">
                    <input
                      type="checkbox"
                      checked={home.featuredCategoryIds.includes(category.id)}
                      onChange={(event) =>
                        updateHome((currentHome) => ({
                          ...currentHome,
                          featuredCategoryIds: toggleId(
                            currentHome.featuredCategoryIds,
                            category.id,
                            event.target.checked
                          ) as HomeContent['featuredCategoryIds']
                        }))
                      }
                    />
                    <span>{category.title}</span>
                  </label>
                ))}
              </div>
            </article>

            <article className="owner-selection-card">
              <h3>Советы на главной</h3>
              <div className="checkbox-list">
                {tips.map((tip) => (
                  <label key={tip.id} className="checkbox-pill checkbox-pill--owner checkbox-pill--owner-wide">
                    <input
                      type="checkbox"
                      checked={home.tipIds.includes(tip.id)}
                      onChange={(event) =>
                        updateHome((currentHome) => ({
                          ...currentHome,
                          tipIds: toggleId(currentHome.tipIds, tip.id, event.target.checked)
                        }))
                      }
                    />
                    <span>{tip.title}</span>
                  </label>
                ))}
              </div>
            </article>
          </div>
        </div>

        <div className="owner-cms-layout">
          <form className="owner-editor-card owner-editor-form" onSubmit={handleBannerSubmit}>
            <div className="owner-editor-list__head">
              <strong>Баннеры</strong>
              <span>{banners.length} шт.</span>
            </div>
            <label className="field">
              <span>Заголовок баннера</span>
              <input
                value={bannerDraft.title}
                onChange={(event) => setBannerDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="field field--textarea">
              <span>Подзаголовок</span>
              <textarea
                rows={4}
                value={bannerDraft.subtitle}
                onChange={(event) => setBannerDraft((current) => ({ ...current, subtitle: event.target.value }))}
              />
            </label>
            <div className="owner-editor-form__grid owner-editor-form__grid--double">
              <label className="field">
                <span>Ссылка</span>
                <input
                  value={bannerDraft.linkPath}
                  onChange={(event) => setBannerDraft((current) => ({ ...current, linkPath: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Тон</span>
                <select
                  value={bannerDraft.tone}
                  onChange={(event) =>
                    setBannerDraft((current) => ({
                      ...current,
                      tone: event.target.value as HomeBanner['tone']
                    }))
                  }
                >
                  <option value="coast">Coast</option>
                  <option value="bridge">Bridge</option>
                  <option value="sunset">Sunset</option>
                  <option value="emerald">Emerald</option>
                </select>
              </label>
            </div>
            <label className="field field--file">
              <span>{isBannerUploading ? 'Загрузка баннера...' : 'Фото баннера'}</span>
              <input type="file" accept="image/*" onChange={handleBannerImage} disabled={isBannerUploading} />
            </label>
            <label className="checkbox-pill checkbox-pill--owner checkbox-pill--owner-wide">
              <input
                type="checkbox"
                checked={bannerDraft.active}
                onChange={(event) => setBannerDraft((current) => ({ ...current, active: event.target.checked }))}
              />
              <span>Показывать баннер</span>
            </label>
            <div className="owner-editor-form__actions">
              <button className="button button--primary" type="submit" disabled={isBannerUploading}>
                {bannerDraft.id ? 'Сохранить баннер' : 'Добавить баннер'}
              </button>
              <button className="button button--ghost" type="button" onClick={() => setBannerDraft(initialBannerDraft)}>
                Очистить
              </button>
            </div>
          </form>

          <div className="owner-editor-card owner-editor-list">
            <div className="owner-editor-list__head">
              <strong>Текущие баннеры</strong>
              <span>{banners.length} шт.</span>
            </div>
            <div className="owner-item-list">
              {banners.map((banner) => (
                <article key={banner.id} className="owner-item-card">
                  <div className="owner-item-card__top">
                    <div>
                      <h3>{banner.title}</h3>
                      <p>{banner.linkPath}</p>
                    </div>
                    <span className="owner-item-card__rating">{banner.active ? 'ON' : 'OFF'}</span>
                  </div>
                  <p className="owner-item-card__description">{banner.subtitle}</p>
                  <div className="owner-item-card__actions">
                    <button className="button button--ghost" type="button" onClick={() => setBannerDraft(banner)}>
                      Редактировать
                    </button>
                    <button className="button button--ghost" type="button" onClick={() => deleteBanner(banner.id)}>
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="owner-cms-layout">
          <form className="owner-editor-card owner-editor-form" onSubmit={handleCollectionSubmit}>
            <div className="owner-editor-list__head">
              <strong>Подборки</strong>
              <span>{collections.length} шт.</span>
            </div>
            <label className="field">
              <span>Название подборки</span>
              <input
                value={collectionDraft.title}
                onChange={(event) => setCollectionDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="field field--textarea">
              <span>Описание</span>
              <textarea
                rows={4}
                value={collectionDraft.description}
                onChange={(event) => setCollectionDraft((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Ссылка</span>
              <input
                value={collectionDraft.linkPath}
                onChange={(event) => setCollectionDraft((current) => ({ ...current, linkPath: event.target.value }))}
              />
            </label>
            <label className="field field--file">
              <span>Фото подборки</span>
              <input type="file" accept="image/*" onChange={handleCollectionImage} disabled={isCollectionUploading} />
            </label>
            <fieldset className="field fieldset">
              <legend>Карточки в подборке</legend>
              <div className="checkbox-list">
                {places.map((place) => (
                  <label key={place.id} className="checkbox-pill checkbox-pill--owner checkbox-pill--owner-wide">
                    <input
                      type="checkbox"
                      checked={collectionDraft.itemIds.includes(place.id)}
                      onChange={(event) =>
                        setCollectionDraft((current) => ({
                          ...current,
                          itemIds: toggleId(current.itemIds, place.id, event.target.checked)
                        }))
                      }
                    />
                    <span>{place.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="checkbox-pill checkbox-pill--owner checkbox-pill--owner-wide">
              <input
                type="checkbox"
                checked={collectionDraft.active}
                onChange={(event) => setCollectionDraft((current) => ({ ...current, active: event.target.checked }))}
              />
              <span>Показывать подборку</span>
            </label>
            <div className="owner-editor-form__actions">
              <button className="button button--primary" type="submit" disabled={isCollectionUploading}>
                {collectionDraft.id ? 'Сохранить подборку' : 'Добавить подборку'}
              </button>
              <button className="button button--ghost" type="button" onClick={() => setCollectionDraft(initialCollectionDraft)}>
                Очистить
              </button>
            </div>
          </form>

          <div className="owner-editor-card owner-editor-list">
            <div className="owner-editor-list__head">
              <strong>Текущие подборки</strong>
              <span>{collections.length} шт.</span>
            </div>
            <div className="owner-item-list">
              {collections.map((collection) => (
                <article key={collection.id} className="owner-item-card">
                  <div className="owner-item-card__top">
                    <div>
                      <h3>{collection.title}</h3>
                      <p>{collection.itemIds.length} карточек</p>
                    </div>
                    <span className="owner-item-card__rating">{collection.active ? 'ON' : 'OFF'}</span>
                  </div>
                  <p className="owner-item-card__description">{collection.description}</p>
                  <div className="owner-item-card__actions">
                    <button
                      className="button button--ghost"
                      type="button"
                      onClick={() =>
                        setCollectionDraft({
                          id: collection.id,
                          title: collection.title,
                          description: collection.description,
                          linkPath: collection.linkPath,
                          imageSrc: collection.imageSrc,
                          itemIds: collection.itemIds,
                          active: collection.active
                        })
                      }
                    >
                      Редактировать
                    </button>
                    <button className="button button--ghost" type="button" onClick={() => deleteCollection(collection.id)}>
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {status ? <div className="owner-editor-status">{status}</div> : null}
      </div>
    </section>
  );
}
