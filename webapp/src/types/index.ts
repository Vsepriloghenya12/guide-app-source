export type HomeFeature = {
  id: string;
  title: string;
  description: string;
  path: string;
};

export type HomeCategory = {
  id: string;
  title: string;
  path: string;
  badge?: string;
};

export type PublishStatus = 'published' | 'draft' | 'hidden';

export type RestaurantKind = 'restaurant' | 'club' | 'canteen' | 'coffee';
export type RestaurantCuisine = 'european' | 'caucasian' | 'thai' | 'vietnamese';
export type WellnessService =
  | 'massage'
  | 'sauna'
  | 'spa'
  | 'hammam'
  | 'cosmetology'
  | 'wraps'
  | 'yoga';

export type BaseListing = {
  id: string;
  title: string;
  address: string;
  description: string;
  rating: number;
  imageLabel: string;
  imageUrl: string;
  phone: string;
  website: string;
  hours: string;
  isFeatured: boolean;
  featuredRank: number;
  status: PublishStatus;
};

export type RestaurantItem = BaseListing & {
  kind: RestaurantKind;
  cuisine: RestaurantCuisine;
  breakfast: boolean;
  vegan: boolean;
  pets: boolean;
  avgCheck: number;
};

export type WellnessItem = BaseListing & {
  services: WellnessService[];
  childPrograms: boolean;
};

export type HomeTip = {
  id: string;
  title: string;
  path: string;
};

export type FeaturedHomeItem = {
  id: string;
  title: string;
  path: string;
  imageUrl: string;
  imageLabel: string;
  category: 'restaurants' | 'wellness';
};

export type PublicGuideContent = {
  restaurants: RestaurantItem[];
  wellness: WellnessItem[];
  featured: FeaturedHomeItem[];
  tips: HomeTip[];
};

export type OwnerSettings = {
  homeTips: HomeTip[];
};

export type OwnerBootstrap = {
  restaurants: RestaurantItem[];
  wellness: WellnessItem[];
  settings: OwnerSettings;
};
