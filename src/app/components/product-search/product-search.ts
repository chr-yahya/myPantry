import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { signal } from '@angular/core';
import { OpenFoodFactService } from '../../services/oen-food-facts';
import { OpenFoodFactsProduct } from '../../models/product.model';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';
import { Mypantry } from '../../services/mypantry';
import { PantryProduct } from '../../models/pantry-product.model';
interface ProductSearchResult {
  found: boolean;
  product?: OpenFoodFactsProduct;
}

type ExpirationSort = '' | 'asc' | 'desc';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule
  ],
  templateUrl: './product-search.html',
  styleUrls: ['./product-search.css']
})
export class ProductSearchComponent {
  private readonly offService = inject(OpenFoodFactService);
  private readonly myPantryService = inject(Mypantry);

  barcode: string = '3017624010701';

  quantity: number = 1;
  unit: string = 'pot';
  expirationDate: string = '2026-12-20';
  minThreshold: number = 1;
  location: string = 'Placard';
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly validationError = signal('');
  product$?: Observable<ProductSearchResult>;
  readonly categoryFilter = new BehaviorSubject<string>('');
  readonly locationFilter = new BehaviorSubject<string>('');
  readonly expirationSort = new BehaviorSubject<ExpirationSort>('asc');
  products$ = this.myPantryService.getProducts().pipe(
    catchError((error) => {
      this.errorMessage.set(this.getFirebaseErrorMessage(error));
      return of([] as PantryProduct[]);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  categoryOptions$ = this.products$.pipe(
    map((products) => this.uniqueSorted(products.flatMap((product) => this.getCategories(product)))),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  locationOptions$ = this.products$.pipe(
    map((products) => this.uniqueSorted(products.map((product) => product.location))),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  filteredProducts$ = combineLatest([
    this.products$,
    this.categoryFilter,
    this.locationFilter,
    this.expirationSort
  ]).pipe(
    map(([products, selectedCategory, selectedLocation, selectedExpirationSort]) => {
      const filteredProducts = products.filter((product) => {
        const matchesCategory = !selectedCategory || this.getCategories(product).includes(selectedCategory);
        const matchesLocation = !selectedLocation || product.location === selectedLocation;

        return matchesCategory && matchesLocation;
      });

      if (!selectedExpirationSort) {
        return filteredProducts;
      }

      return [...filteredProducts].sort((first, second) => {
        const firstDate = this.getExpirationTimestamp(first.expirationDate);
        const secondDate = this.getExpirationTimestamp(second.expirationDate);

        if (firstDate === null && secondDate === null) {
          return 0;
        }
        if (firstDate === null) {
          return 1;
        }
        if (secondDate === null) {
          return -1;
        }

        const comparison = firstDate - secondDate;
        return selectedExpirationSort === 'asc' ? comparison : -comparison;
      });
    })
  );

  search(): void {
    const barcode = this.barcode.trim();
    if (!barcode) {
      this.errorMessage.set('Veuillez entrer un code-barres valide.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.product$ = this.offService.getProduct(barcode).pipe(
      map((response) => ({
        found: response.status === 1 && !!response.product,
        product: response.product
      })),
      catchError((error) => {
        console.error('Erreur lors de la récupération du produit :', error);
        this.errorMessage.set('Une erreur est survenue lors de la récupération du produit.');
        return of({ found: false });
      }),
      finalize(() => this.loading.set(false))
    );
  }

  validateInput(): boolean {
    const errors: string[] = [];
    const trimmedBarcode = this.barcode.trim();

    if (!/^\d+$/.test(trimmedBarcode)) {
      errors.push('Le code-barres doit contenir uniquement des chiffres.');
    }
    if (!Number.isFinite(this.quantity) || this.quantity < 1) {
      errors.push('La quantité doit être supérieure à 0.');
    }
    if (!this.unit.trim()) {
      errors.push("L'unité est obligatoire.");
    }
    if (!Number.isFinite(this.minThreshold) || this.minThreshold < 0) {
      errors.push('Le seuil minimum doit être supérieur ou égal à 0.');
    }
    if (!this.location.trim()) {
      errors.push("L'emplacement est obligatoire.");
    }

    this.validationError.set(errors.join(' '));
    return errors.length === 0;
  }

  addToPantry(product: OpenFoodFactsProduct): void {
    if (!this.validateInput()) {
      return;
    }

    const pantryProduct: PantryProduct = {
      barcode: this.barcode.trim(),
      name: product.product_name ?? 'Nom inconnu',
      brand: product.brands ?? '',
      category: product.categories_tags ?? [],
      image: product.image_front_url ?? '',
      quantity: this.quantity,
      unit: this.unit,
      expirationDate: this.expirationDate,
      location: this.location,
      minQuantity: this.minThreshold
    };
    this.myPantryService.addProduct(pantryProduct).subscribe({
      next: () => {
        console.log('Produit ajouté à MyPantry :', pantryProduct);
        alert(`Produit "${product.product_name}" ajouté au stock avec succès !`);
      },
      error: (error) => {
        this.errorMessage.set(this.getFirebaseErrorMessage(error));
        console.error('Erreur lors de l\'ajout du produit à MyPantry :', error);
        alert(this.getFirebaseErrorMessage(error));
      }
    });
  }
  updatePantryProduct(product: PantryProduct): void {
  if (!product.id) {
    return;
  }

  this.myPantryService.updateProduct(product.id, {
    quantity: product.quantity,
    unit: product.unit,
    expirationDate: product.expirationDate,
    location: product.location,
    minQuantity: product.minQuantity
  }).subscribe({
    next: () => alert('Produit modifié'),
    error: error => {
      const message = this.getFirebaseErrorMessage(error);
      console.error('Erreur Firestore lors de la modification :', error);
      this.errorMessage.set(message);
      alert(message);
    }
  });
}
  deletePantryProduct(product: PantryProduct): void {
  if (!product.id) {
    return;
  }

  const confirmed = confirm(`Supprimer "${product.name}" ?`);

  if (!confirmed) {
    return;
  }

  this.myPantryService.deleteProduct(product.id).subscribe({
    next: () => alert('Produit supprimé'),
    error: error => {
      const message = this.getFirebaseErrorMessage(error);
      console.error('Erreur Firestore lors de la suppression :', error);
      this.errorMessage.set(message);
      alert(message);
    }
  });
}

  private getCategories(product: PantryProduct): string[] {
    const category = product.category as unknown;

    if (Array.isArray(category)) {
      return category.filter((value): value is string => typeof value === 'string' && value.trim() !== '');
    }

    if (typeof category === 'string') {
      return category.split(',').map((value) => value.trim()).filter(Boolean);
    }

    return [];
  }

  private uniqueSorted(values: string[]): string[] {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second));
  }

  private getExpirationTimestamp(expirationDate?: string): number | null {
    if (!expirationDate?.trim()) {
      return null;
    }

    const timestamp = Date.parse(expirationDate);
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  private getFirebaseErrorMessage(error: unknown): string {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code)
        : '';

    switch (code) {
      case 'permission-denied':
        return 'Accès refusé par Firebase. Vérifiez les règles Firestore.';
      case 'unavailable':
        return 'Firebase est temporairement indisponible. Vérifiez votre connexion.';
      case 'not-found':
        return 'Le produit demandé est introuvable dans Firebase.';
      case 'invalid-argument':
        return 'Les données envoyées à Firebase sont invalides.';
      case 'failed-precondition':
        return 'Cette opération ne peut pas être effectuée dans l’état actuel de Firebase.';
      default:
        return 'Une erreur Firebase est survenue. Veuillez réessayer.';
    }
  }
}
