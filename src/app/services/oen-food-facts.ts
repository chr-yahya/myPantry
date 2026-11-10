import {inject,  Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OpenFoodFactsResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class OpenFoodFactService {
  private readonly http = inject(HttpClient);
  getProduct(barcode: string){
    return this.http.get<OpenFoodFactsResponse>(
      `https://world.openfoodfacts.org/api/v3/product/${barcode}.json?fields=product_name,brands,image_front_url,categories_tags,nutriscore_grade`
    );
}
}
