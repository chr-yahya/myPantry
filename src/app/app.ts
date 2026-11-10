import { Component,inject } from '@angular/core';
import { ProductSearchComponent } from './components/product-search/product-search';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './services/auth-service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule],
  template: `
    @if (authService.user$ | async; as user) {
      <mat-toolbar color="primary" style="display: flex; justify-content: space-between; align-items: center;">
        <span>MyPantry - {{ user.email }}</span>
        <button mat-button (click)="logout()">Déconnexion</button>
      </mat-toolbar>
    }
      <router-outlet></router-outlet>
  `
})
export class App {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/sign-in']);
  }
}
