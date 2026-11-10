import { Component , inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router)
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    try{
      await this.authService.signIn(this.email,this.password);
      this.router.navigate(['/stock']);
    }
    catch(err:any){
      this.errorMessage = this.getAuthErrorMessage(err);
    }

  }

  async resetPassword(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Saisissez votre email pour recevoir le lien de réinitialisation.';
      return;
    }

    try {
      await this.authService.resetPassword(this.email.trim());
      this.successMessage = 'Un email de réinitialisation a été envoyé.';
    } catch (error: any) {
      this.errorMessage = this.getAuthErrorMessage(error);
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.signInWithGoogle();
      await this.router.navigate(['/stock']);
    } catch (error: any) {
      this.errorMessage = this.getAuthErrorMessage(error);
    }
  }

  private getAuthErrorMessage(error: { code?: string; message?: string }): string {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Cette adresse email est invalide.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email ou mot de passe incorrect.';
      case 'auth/user-disabled':
        return 'Ce compte est désactivé.';
      case 'auth/operation-not-allowed':
        return 'Cette méthode de connexion n’est pas activée dans Firebase.';
      case 'auth/popup-closed-by-user':
        return 'La fenêtre de connexion Google a été fermée.';
      default:
        return error.message || 'Une erreur d’authentification est survenue.';
    }
  }
}
