

export interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  categories_tags?: string[];
  nutriscore_grade?: string;
}

export interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}