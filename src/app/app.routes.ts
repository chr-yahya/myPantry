import { Routes } from '@angular/router';
import { SignIn } from './pages/sign-in/sign-in';
import { SignUp } from './pages/sign-up/sign-up';
import { ProductSearchComponent } from './components/product-search/product-search'; // Adaptez le chemin
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
    { path: 'sign-in', component: SignIn, canActivate: [guestGuard] },
    { path: 'sign-up', component: SignUp, canActivate: [guestGuard] },
    { 
    path: 'stock', 
    component: ProductSearchComponent, 
    canActivate: [authGuard]
    },
  { path: '', redirectTo: 'stock', pathMatch: 'full' },
  { path: '**', redirectTo: 'stock' }
];
