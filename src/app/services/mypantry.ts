import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { AuthService } from './auth-service';
import { 
  catchError, 
  defer, 
  from, 
  map, 
  Observable, 
  of, 
  switchMap, 
  take, 
  throwError 
} from 'rxjs';
import { PantryProduct } from '../models/pantry-product.model';

@Injectable({
  providedIn: 'root',
})
export class Mypantry {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);
  private readonly productsRef = collection(this.firestore, 'products');
  private readonly authService = inject(AuthService);

  addProduct(product: PantryProduct): Observable<void> {
    const { id, ...productData } = product;

    return this.authService.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('Utilisateur non connecté'));
        }

        // Ajout du userId de l'utilisateur connecté
        const dataToSave = {
          ...productData,
          userId: user.uid
        };

        return defer(() =>
          runInInjectionContext(this.injector, () =>
            from(addDoc(this.productsRef, dataToSave))
          )
        );
      }),
      map(() => void 0),
      catchError((error) => this.handleFirestoreError('addProduct', error))
    );
  }

  getProducts(): Observable<PantryProduct[]> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        // Si aucun utilisateur n'est connecté, on renvoie une liste vide
        if (!user) {
          return of([]);
        }

        // Requête filtrée sur l'UID de l'utilisateur connecté
        const userProductsQuery = query(
          this.productsRef,
          where('userId', '==', user.uid)
        );

        return defer(() =>
          runInInjectionContext(this.injector, () =>
            collectionData(userProductsQuery, { idField: 'id' })
          )
        ) as Observable<PantryProduct[]>;
      }),
      catchError((error) => this.handleFirestoreError('getProducts', error))
    );
  }

  updateProduct(
    id: string,
    changes: Partial<PantryProduct>
  ): Observable<void> {
    const productRef = doc(this.productsRef, id);

    return from(updateDoc(productRef, changes)).pipe(
      map(() => void 0),
      catchError((error) => this.handleFirestoreError('updateProduct', error))
    );
  }

  deleteProduct(id: string): Observable<void> {
    const productRef = doc(this.productsRef, id);

    return from(deleteDoc(productRef)).pipe(
      map(() => void 0),
      catchError((error) => this.handleFirestoreError('deleteProduct', error))
    );
  }

  private handleFirestoreError(operation: string, error: unknown): Observable<never> {
    console.error(`Firestore error in ${operation}:`, error);
    return throwError(() => error);
  }
}