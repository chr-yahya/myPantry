import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideHttpClient} from '@angular/common/http';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(), provideFirebaseApp(() => initializeApp({ apiKey: "AIzaSyB7TnhQF47sHjTQvX6Z1k7ftIz5xrt24U4", authDomain: "mypanrtyapp.firebaseapp.com", projectId: "mypanrtyapp", storageBucket: "mypanrtyapp.firebasestorage.app", messagingSenderId: "1060858219204", appId: "1:1060858219204:web:882701c7ab3e38b96f9791", measurementId: "G-ZLT9E3CTLS" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())
  ]
};
