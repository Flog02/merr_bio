import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
  template: `
    <ion-header>
      <ion-toolbar color="danger">
        <ion-title>Unauthorized Access</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="error-container">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this resource.</p>
        <ion-button expand="block" (click)="goHome()">Return to Home</ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 100%;
      padding: 0 20px;
    }
    h2 {
      color: var(--ion-color-danger);
      margin-bottom: 16px;
    }
    p {
      margin-bottom: 32px;
      font-size: 18px;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/home']);
  }
}