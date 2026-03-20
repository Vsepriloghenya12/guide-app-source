export type FilterOption = {
  value: string;
  label: string;
};

export type FilterConfig = {
  key: string;
  label: string;
  type: 'single' | 'multi' | 'boolean';
  field: string;
  options?: FilterOption[];
  trueLabel?: string;
};

export type Category = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  coverImageUrl: string;
  accent: string;
  sortOrder: number;
  isActive?: boolean;
  filterSchema: FilterConfig[];
};

export type ListingExtra = Record<string, string | number | boolean | null | undefined>;

export type Listing = {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  shortDescription: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  mapQuery: string;
  averagePrice: number | null;
  priceLabel: string;
  rating: number;
  listingType: string;
  cuisine: string;
  services: string[];
  tags: string[];
  features: string[];
  childFriendly: boolean;
  petFriendly: boolean;
  status: 'published' | 'hidden' | 'draft';
  sortOrder: number;
  featured: boolean;
  imageUrls: string[];
  extra: ListingExtra;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  linkPath: string;
  sortOrder: number;
  isActive: boolean;
};

export type CollectionItem = {
  id: string;
  collectionSlug: string;
  itemType: 'listing' | 'category' | 'tip' | 'custom';
  listingSlug?: string | null;
  categorySlug?: string | null;
  title: string;
  description: string;
  path?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  sortOrder: number;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  kind: 'listings' | 'categories' | 'tips' | string;
  sortOrder: number;
  isActive: boolean;
  items: CollectionItem[];
};

export type BootstrapPayload = {
  categories: Category[];
  collections: Collection[];
  banners: Banner[];
};
