export interface ServiceInsert {
  name: string;
  description?: string;
  price: number;
  estimatedDurationInMinutes: number;
  priceDisplay?: string;
  durationDisplay?: string;
  isFeatured?: boolean;
}
