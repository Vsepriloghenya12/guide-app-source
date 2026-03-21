export type GuideCategoryId =
  | 'restaurants'
  | 'wellness'
  | 'active-rest'
  | 'routes'
  | 'hotels'
  | 'events'
  | 'transport'
  | 'atm'
  | 'shops'
  | 'culture'
  | 'kids'
  | 'medicine'
  | 'photo-spots'
  | 'car-rental';

export type GuideCategory = {
  id: GuideCategoryId;
  title: string;
  path: string;
  badge?: string;
  description?: string;
  visible: boolean;
  showOnHome: boolean;
};

export type GuidePlace = {
  id: string;
  categoryId: GuideCategoryId;
  title: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  avgCheck?: number;
  kind: string;
  cuisine: string;
  services: string[];
  tags: string[];
  breakfast: boolean;
  vegan: boolean;
  pets: boolean;
  childPrograms: boolean;
  top: boolean;
  rating: number;
  imageLabel: string;
  imageSrc: string;
  imageGallery?: string[];
};

export type GuideTip = {
  id: string;
  title: string;
  text: string;
  linkPath: string;
  active: boolean;
};

export type HomeBanner = {
  id: string;
  title: string;
  subtitle: string;
  linkPath: string;
  tone: 'coast' | 'bridge' | 'sunset' | 'emerald';
  imageSrc: string;
  active: boolean;
};

export type GuideCollection = {
  id: string;
  title: string;
  description: string;
  linkPath: string;
  imageSrc: string;
  itemIds: string[];
  active: boolean;
};

export type HomeSectionTitles = {
  popular: string;
  categories: string;
  tips: string;
  collections: string;
  allCategories: string;
};

export type HomeContent = {
  popularPlaceIds: string[];
  featuredCategoryIds: GuideCategoryId[];
  tipIds: string[];
  bannerIds: string[];
  collectionIds: string[];
  sectionTitles: HomeSectionTitles;
};

export type GuideContentStore = {
  version: 2;
  places: GuidePlace[];
  categories: GuideCategory[];
  tips: GuideTip[];
  banners: HomeBanner[];
  collections: GuideCollection[];
  home: HomeContent;
};

// Compatibility aliases for older pages/API client
export type Category = GuideCategory;

export type Listing = GuidePlace & {
  slug?: string;
  imageUrls?: string[];
  coverImageUrl?: string;
  websiteUrl?: string;
  phoneNumber?: string;
  district?: string;
  location?: string;
  type?: string;
};

export type Banner = HomeBanner;
export type Collection = GuideCollection;

export type BootstrapPayload = {
  categories: Category[];
  listings: Listing[];
  banners: Banner[];
  collections: Collection[];
  tips: GuideTip[];
  home: HomeContent;
};
