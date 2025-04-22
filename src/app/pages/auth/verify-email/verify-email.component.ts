import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { TranslatePipe } from 'src/app/pipes/translate.pipe';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonSpinner, IonIcon, ToastController
} from '@ionic/angular/standalone';
import { take } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule, 
    TranslatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonSpinner, IonIcon
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ 'EMAIL_VERIFICATION' | translate }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ 'VERIFY_YOUR_EMAIL' | translate }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <!-- Verify using link in email -->
          <div *ngIf="!verifying && !verificationComplete">
            <p>{{ 'VERIFICATION_INSTRUCTIONS' | translate }}</p>
            <p class="email-sent-to" *ngIf="userEmail">
              {{ 'EMAIL_SENT_TO' | translate }}: <strong>{{ userEmail }}</strong>
            </p>
            
            <div class="actions">
              <ion-button expand="block" (click)="resendVerificationEmail()" [disabled]="resending">
                <ion-spinner *ngIf="resending" name="circles" class="button-spinner"></ion-spinner>
                <span *ngIf="!resending">{{ 'RESEND_EMAIL' | translate }}</span>
              </ion-button>
              
              <ion-button expand="block" fill="outline" (click)="checkVerificationStatus()" [disabled]="checking">
                <ion-spinner *ngIf="checking" name="circles" class="button-spinner"></ion-spinner>
                <span *ngIf="!checking">{{ 'CHECK_STATUS' | translate }}</span>
              </ion-button>
            </div>
          </div>

          <!-- Verifying email from link -->
          <div *ngIf="verifying" class="verification-progress">
            <ion-spinner name="circles"></ion-spinner>
            <p>{{ 'VERIFYING_EMAIL' | translate }}</p>
          </div>

          <!-- Verification complete -->
          <div *ngIf="verificationComplete" class="verification-complete">
            <div class="success-icon">
              <ion-icon name="checkmark-circle"></ion-icon>
            </div>
            <h2>{{ 'VERIFICATION_SUCCESSFUL' | translate }}</h2>
            <p>{{ 'ACCOUNT_ACTIVATED' | translate }}</p>
            <ion-button expand="block" (click)="continueToApp()">
              {{ 'CONTINUE' | translate }}
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: `
    ion-card {
      max-width: 500px;
      margin: 2rem auto;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    ion-card-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--ion-color-primary);
      margin-bottom: 1rem;
      text-align: center;
    }
    
    p {
      font-size: 16px;
      line-height: 1.5;
      color: var(--ion-color-dark);
      margin-bottom: 1rem;
    }
    
    .email-sent-to {
      margin: 1.5rem 0;
      padding: 0.75rem;
      background-color: var(--ion-color-light);
      border-radius: 8px;
      text-align: center;
    }
    
    .actions {
      margin-top: 2rem;
      
      ion-button {
        margin-bottom: 1rem;
      }
    }
    
    .button-spinner {
      margin-right: 8px;
    }
    
    .verification-progress {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 0;
      
      ion-spinner {
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
      }
      
      p {
        font-size: 18px;
        text-align: center;
      }
    }
    
    .verification-complete {
      text-align: center;
      padding: 1.5rem 0;
      
      .success-icon {
        margin-bottom: 1.5rem;
        
        ion-icon {
          font-size: 64px;
          color: var(--ion-color-success);
        }
      }
      
      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ion-color-success);
        margin-bottom: 0.5rem;
      }
      
      p {
        margin-bottom: 2rem;
        text-align: center;
      }
    }
  `
})
export class VerifyEmailPage implements OnInit {
  verifying = false;
  verificationComplete = false;
  resending = false;
  checking = false;
  userEmail: string | null = null;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Get current user email
    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.userEmail = user.email;
      }
    });

    // Check for actionCode in URL (when user clicks verification link)
    this.route.queryParams.subscribe(params => {
      const actionCode = params['oobCode'];
      
      if (actionCode) {
        this.verifying = true;
        
        this.authService.verifyEmail(actionCode).subscribe({
          next: (success) => {
            this.verifying = false;
            
            if (success) {
              this.verificationComplete = true;
            } else {
              this.presentToast('Verification failed. Please try again.', 'danger');
            }
          },
          error: () => {
            this.verifying = false;
            this.presentToast('Verification link expired or invalid. Please request a new one.', 'danger');
          }
        });
      }
    });
  }

  resendVerificationEmail() {
    this.resending = true;
    
    this.authService.resendVerificationEmail().subscribe({
      next: (success) => {
        this.resending = false;
        
        if (success) {
          this.presentToast('Verification email sent successfully', 'success');
        } else {
          this.presentToast('Failed to send verification email', 'danger');
        }
      },
      error: () => {
        this.resending = false;
        this.presentToast('Error sending verification email', 'danger');
      }
    });
  }

  checkVerificationStatus() {
    this.checking = true;
    
    this.authService.checkEmailVerified().subscribe({
      next: (isVerified) => {
        this.checking = false;
        
        if (isVerified) {
          this.verificationComplete = true;
        } else {
          this.presentToast('Email not verified yet. Please check your inbox and click the verification link.', 'warning');
        }
      },
      error: () => {
        this.checking = false;
        this.presentToast('Error checking verification status', 'danger');
      }
    });
  }

  continueToApp() {
    // Redirect based on user role
    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        switch (user.role) {
          case 'farmer':
            this.router.navigate(['/farmer/dashboard']);
            break;
          case 'customer':
            this.router.navigate(['/customer/dashboard']);
            break;
          case 'admin':
            this.router.navigate(['/admin/dashboard']);
            break;
          default:
            this.router.navigate(['/']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    
    await toast.present();
  }
}