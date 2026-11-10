export interface PantryProduct {
  id?: string;
  userId?: string;
  barcode?: string;
  name: string;
  brand?: string;
  category?: string[];
  image?: string;
  quantity: number;
  unit: string;
  purchaseDate?: string;
  expirationDate?: string;
  location: string;
  minQuantity: number;
}
