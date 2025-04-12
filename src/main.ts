// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage())
  ],
});

import { addIcons } from 'ionicons';
import {search,water, home, list, logIn, personAdd, grid, cart, chatbubbles, addCircle, listCircle, shield, logOut, arrowForward } from 'ionicons/icons';

addIcons({
  home,
  search,
  list,
  'log-in': logIn,
  'person-add': personAdd,
  'arrow-forward':arrowForward,
  'water':water,
  grid,
  cart,
  chatbubbles,
  'add-circle': addCircle,
  'list-circle': listCircle,
  shield,
  'log-out': logOut,
});