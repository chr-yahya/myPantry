import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User
} from '@angular/fire/auth';
import {Observable} from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  readonly user$ : Observable<User | null> = authState(this.auth);

  signUp(email: string, password: string){
    return createUserWithEmailAndPassword(this.auth, email, password);
  }
  signIn(email: string, password: string){
    return signInWithEmailAndPassword(this.auth, email, password);
  }
  resetPassword(email: string){
    return sendPasswordResetEmail(this.auth, email);
  }
  signInWithGoogle(){
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }
  signOut(){
    return signOut(this.auth);
  }
}
