import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonIcon,
  IonBackButton,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { TranslatePipe } from 'src/app/pipes/translate.pipe';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSpinner,
    IonIcon,
    IonBackButton,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ 'FORGOT_PASSWORD' | translate }}</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/login"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ 'RESET_YOUR_PASSWORD' | translate }}</ion-card-title>
        </ion-card-header>
        
        <ion-card-content>
          <p class="instruction-text">{{ 'PASSWORD_RESET_INSTRUCTIONS' | translate }}</p>
          
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            <ion-item [class.ion-invalid]="isEmailInvalid()">
              <ion-label position="floating">{{ 'EMAIL' | translate }}</ion-label>
              <ion-input type="email" formControlName="email"></ion-input>
            </ion-item>
            <div class="error-message" *ngIf="isEmailInvalid()">
              {{ 'EMAIL_INVALID' | translate }}
            </div>
            
            <ion-button expand="block" type="submit" [disabled]="!resetForm.valid || isSubmitting" class="submit-button">
              <ion-spinner *ngIf="isSubmitting" name="circles" class="button-spinner"></ion-spinner>
              <span *ngIf="!isSubmitting">{{ 'SEND_RESET_LINK' | translate }}</span>
            </ion-button>
          </form>
          
          <!-- Success message -->
          <div *ngIf="emailSent" class="success-message">
            <ion-icon name="mail-outline"></ion-icon>
            <p>{{ 'RESET_EMAIL_SENT' | translate }}</p>
            <p class="email-text">{{ resetForm.get('email')?.value }}</p>
            <p>{{ 'CHECK_INBOX_INSTRUCTIONS' | translate }}</p>
          </div>
          
          <div class="form-footer">
            <a routerLink="/login" class="return-link">{{ 'BACK_TO_LOGIN' | translate }}</a>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: `
    ion-card {
      max-width: 500px;
      margin: 20px auto;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
    
    ion-card-header {
      padding-bottom: 0;
    }
    
    ion-card-title {
      font-size: 24px;
      color: var(--ion-color-primary);
      margin-bottom: 8px;
    }
    
    .instruction-text {
      margin: 16px 0;
      color: var(--ion-color-medium);
      font-size: 16px;
      line-height: 1.5;
    }
    
    ion-item {
      --padding-start: 0;
      --inner-padding-end: 0;
      margin-bottom: 16px;
    }
    
    .error-message {
      color: var(--ion-color-danger);
      font-size: 14px;
      margin-top: -12px;
      margin-bottom: 16px;
      padding-left: 8px;
    }
    
    .submit-button {
      margin-top: 16px;
      margin-bottom: 16px;
      height: 48px;
    }
    
    .button-spinner {
      margin-right: 8px;
    }
    
    .success-message {
      background-color: rgba(var(--ion-color-success-rgb), 0.1);
      border-left: 4px solid var(--ion-color-success);
      padding: 16px;
      border-radius: 4px;
      margin: 20px 0;
      text-align: center;
    }
    
    .success-message ion-icon {
      font-size: 48px;
      color: var(--ion-color-success);
      margin-bottom: 16px;
    }
    
    .success-message p {
      margin: 8px 0;
      color: var(--ion-color-dark);
    }
    
    .email-text {
      font-weight: bold;
      color: var(--ion-color-dark);
    }
    
    .form-footer {
      margin-top: 24px;
      text-align: center;
    }
    
    .return-link {
      color: var(--ion-color-primary);
      text-decoration: none;
      font-weight: 500;
    }
    
    .ion-invalid {
      --highlight-color: var(--ion-color-danger);
    }
  `
})
export class ForgotPasswordPage {
  resetForm: FormGroup;
  isSubmitting: boolean = false;
  emailSent: boolean = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  isEmailInvalid(): boolean {
    const control = this.resetForm.get('email');
    return control?.touched && (control?.hasError('required') || control?.hasError('email')) || false;
  }
  
  onSubmit(): void {
    if (this.resetForm.invalid) {
      Object.keys(this.resetForm.controls).forEach(key => {
        this.resetForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    const email = this.resetForm.get('email')?.value;
    this.isSubmitting = true;
    
    this.authService.sendPasswordResetEmail(email)
      .then(() => {
        this.isSubmitting = false;
        this.emailSent = true;
      })
      .catch(error => {
        this.isSubmitting = false;
        
        // Handle specific errors
        if (error.code === 'auth/user-not-found') {
          this.showAlert('USER_NOT_FOUND_TITLE', 'USER_NOT_FOUND_MESSAGE');
        } else {
          this.showToast('ERROR_SENDING_RESET_EMAIL', 'danger');
        }
        
        console.error('Error sending password reset email:', error);
      });
  }
  
  async showToast(message: string, color: string = 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message: this.translateMessage(message),
      duration: 3000,
      position: 'bottom',
      color: color
    });
    
    await toast.present();
  }
  
  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translateMessage(header),
      message: this.translateMessage(message),
      buttons: ['OK']
    });
    
    await alert.present();
  }
  
  // Simple translation helper (in a real app, this would use your translation service)
  private translateMessage(key: string): string {
    // This is just a placeholder - in the real app, you would use the translate pipe
    return key;
  }
}