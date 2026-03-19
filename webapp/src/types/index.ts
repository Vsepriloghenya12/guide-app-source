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
};
