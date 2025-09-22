export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  estimatedDurationInMinutes: number;
  active: boolean;
  imageUrl: string | null;
  priceDisplay: string | null;
  durationDisplay: string | null;
}
