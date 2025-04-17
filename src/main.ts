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
import {search,water,close, home, list, logIn, personAdd, grid, cart, chatbubbles, addCircle, listCircle, shield, logOut, arrowForward, gridOutline, homeOutline, logInOutline, personAddOutline, personOutline, chatbubblesOutline, logOutOutline, speedometerOutline, cartOutline, cubeOutline, people, trash, peopleOutline, shieldOutline, trashOutline, listCircleOutline, addCircleOutline, checkmarkCircleOutline, checkmark, notificationsOutline, checkmarkOutline, person, send, attach, add, settingsOutline, ellipsisVertical, chevronForwardOutline, arrowForwardOutline } from 'ionicons/icons';

addIcons({
  'arrow-forward-outline':arrowForwardOutline,
  'chevron-forward-outline':chevronForwardOutline,
  'home':home,
  'search':search,
  'list':list,
  'settings-outline':settingsOutline,
  'log-in': logIn,
  'person-add': personAdd,
  'arrow-forward':arrowForward,
  'water':water,
  'grid':grid,
  'cart':cart,
  'chatbubbles':chatbubbles,
  'add-circle': addCircle,
  'list-circle': listCircle,
  'shield':shield,
  'log-out': logOut,
  'home-outline': homeOutline,
  'grid-outline': gridOutline,
  'log-in-outline': logInOutline,
  'person-add-outline': personAddOutline,
  'person-outline':personOutline,
  'chatbubbles-outline':chatbubblesOutline,
  'log-out-outline':logOutOutline,
  'speedometer-outline':speedometerOutline,
  'cart-outline':cartOutline,
  'cube-outline':cubeOutline,
  'people':people,
  'trash':trash,
  'people-outline':peopleOutline,
  'shield-outline':shieldOutline,
  'trash-outline':trashOutline,
  'list-circle-outline':listCircleOutline,
  'add-circle-outline':addCircleOutline,
  'checkmark-circle-outline':checkmarkCircleOutline,
  'checkmark':checkmark,
  'notifications-outline':notificationsOutline,
  'checkmark-outline':checkmarkOutline,
  'person':person,
  'send':send,
  'attach':attach,
  'add':add,
  'close': close,
  'ellipsis-vertical':ellipsisVertical
  
});