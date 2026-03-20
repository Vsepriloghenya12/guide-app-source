export type ListingStatus = 'published' | 'hidden' | 'draft';

export type HomeFeature = {
  id: string;
  title: string;
  description: string;
  path: string;
  tone?: 'coast' | 'bridge' | 'night' | 'sunset';
};

export type HomeCategory = {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  badge?: string;
  tone?: 'orange' | 'blue' | 'pink' | 'green' | 'red' | 'teal' | 'violet' | 'gold';
};

export type HomeTip = {
  id: string;
  title: string;
  path: string;
};

export type HomeContent = {
  popular: HomeFeature[];
  categories: HomeCategory[];
  tips: HomeTip[];
};

export type RestaurantItem = {
  id: string;
  title: string;
  kind: 'restaurant' | 'club' | 'canteen' | 'coffee';
  cuisine: 'european' | 'caucasian' | 'thai' | 'vietnamese';
  breakfast: boolean;
  vegan: boolean;
  pets: boolean;
  avgCheck: number;
  address: string;
  description: string;
  rating: number;
  imageLabel: string;
  status: ListingStatus;
  sortOrder: number;
  featured: boolean;
  phone: string;
  website: string;
  hours: string;
  tags: string[];
};

export type WellnessItem = {
  id: string;
  title: string;
  services: Array<
    'massage' | 'sauna' | 'spa' | 'hammam' | 'cosmetology' | 'wraps' | 'yoga'
  >;
  childPrograms: boolean;
  address: string;
  description: string;
  rating: number;
  imageLabel: string;
  status: ListingStatus;
  sortOrder: number;
  featured: boolean;
  phone: string;
  website: string;
  hours: string;
  tags: string[];
};
