export type ClothingItem = {
  id: string;

  name: string;
  category: string;
  image: string;

  subcategory: string[];
  brand: string[];

  color: string[];
  secondaryColor: string[];

  season: string[];
  occasion: string[];

  material: string[];
  fit: string[];

  pattern: string[];
  tags: string[];

  wearCount?: number;
  lastWornAt?: string | null;

  estimatedValueLowEUR?: number | null;
  estimatedValueHighEUR?: number | null;
};