import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthService} from '../../services/auth-service';
import {FormsModule} from '@angular/forms';
import {Router , RouterLink} from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  email='';
  password='';
  confirmPassword='';
  errorMessage='';

  async onSubmit() {
    this.errorMessage = '';

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    try {
      await this.authService.signUp(this.email, this.password);
      this.router.navigate(['/stock']);
    } catch (error: any) {
      this.errorMessage = this.getAuthErrorMessage(error);
    }
  }

  private getAuthErrorMessage(error: { code?: string }): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée.';
      case 'auth/invalid-email':
        return 'Cette adresse email est invalide.';
      case 'auth/weak-password':
        return 'Le mot de passe est trop faible.';
      case 'auth/operation-not-allowed':
        return 'La connexion par email et mot de passe n’est pas activée dans Firebase.';
      default:
        return 'Impossible de créer le compte. Veuillez réessayer.';
    }
  }

}
