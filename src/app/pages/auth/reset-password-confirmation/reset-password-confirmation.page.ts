import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  IonHeader,
  IonToolbar,
  IonTitle,
  IonNote,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-reset-password-confirm',
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
    IonHeader,
    IonToolbar,
    IonTitle,
    IonNote
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ 'RESET_PASSWORD' | translate }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ 'CREATE_NEW_PASSWORD' | translate }}</ion-card-title>
        </ion-card-header>
        
        <ion-card-content>
          <!-- Loading state -->
          <div *ngIf="isVerifying" class="loading-container">
            <ion-spinner name="circles"></ion-spinner>
            <p>{{ 'VERIFYING_RESET_LINK' | translate }}</p>
          </div>
          
          <!-- Invalid or expired code -->
          <div *ngIf="!isVerifying && !isValidCode" class="error-container">
            <ion-icon name="alert-circle" color="danger"></ion-icon>
            <h3>{{ 'INVALID_RESET_LINK' | translate }}</h3>
            <p>{{ 'RESET_LINK_EXPIRED' | translate }}</p>
            <ion-button expand="block" routerLink="/forgot-password">
              {{ 'REQUEST_NEW_LINK' | translate }}
            </ion-button>
          </div>
          
          <!-- Valid code, show reset form -->
          <div *ngIf="!isVerifying && isValidCode">
            <p class="instruction-text">
              {{ 'RESET_PASSWORD_FOR' | translate }} <strong>{{ email }}</strong>
            </p>
            
            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
              <ion-item>
                <ion-label position="floating">{{ 'NEW_PASSWORD' | translate }}</ion-label>
                <ion-input type="password" formControlName="password"></ion-input>
                <ion-note slot="error" *ngIf="isPasswordTooShort()">
                  {{ 'PASSWORD_MIN_LENGTH' | translate }}
                </ion-note>
                <ion-note slot="error" *ngIf="isPasswordMissingCapitalFirst()">
                  {{ 'PASSWORD_CAPITAL_FIRST' | translate }}
                </ion-note>
                <ion-note slot="error" *ngIf="isPasswordMissingNumber()">
                  {{ 'PASSWORD_NUMBER_REQUIRED' | translate }}
                </ion-note>
              </ion-item>
              
              <ion-item>
                <ion-label position="floating">{{ 'CONFIRM_PASSWORD' | translate }}</ion-label>
                <ion-input type="password" formControlName="confirmPassword"></ion-input>
                <ion-note slot="error" *ngIf="passwordsDontMatch()">
                  {{ 'PASSWORDS_DONT_MATCH' | translate }}
                </ion-note>
              </ion-item>
              
              <div class="password-requirements">
                <p>{{ 'PASSWORD_REQUIREMENTS' | translate }}:</p>
                <ul>
                  <li [class.fulfilled]="!isPasswordTooShort()">{{ 'PASSWORD_MIN_LENGTH' | translate }}</li>
                  <li [class.fulfilled]="!isPasswordMissingCapitalFirst()">{{ 'PASSWORD_CAPITAL_FIRST' | translate }}</li>
                  <li [class.fulfilled]="!isPasswordMissingNumber()">{{ 'PASSWORD_NUMBER_REQUIRED' | translate }}</li>
                </ul>
              </div>
              
              <ion-button expand="block" type="submit" [disabled]="!resetForm.valid || isSubmitting" class="submit-button">
                <ion-spinner *ngIf="isSubmitting" name="circles" class="button-spinner"></ion-spinner>
                <span *ngIf="!isSubmitting">{{ 'RESET_PASSWORD' | translate }}</span>
              </ion-button>
            </form>
          </div>
          
          <!-- Success message -->
          <div *ngIf="resetSuccess" class="success-container">
            <ion-icon name="checkmark-circle" color="success"></ion-icon>
            <h3>{{ 'PASSWORD_RESET_SUCCESS' | translate }}</h3>
            <p>{{ 'PASSWORD_RESET_SUCCESS_MESSAGE' | translate }}</p>
            <ion-button expand="block" routerLink="/login">
              {{ 'GO_TO_LOGIN' | translate }}
            </ion-button>
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
    
    .submit-button {
      margin-top: 16px;
      margin-bottom: 16px;
      height: 48px;
    }
    
    .button-spinner {
      margin-right: 8px;
    }
    
    .loading-container,
    .error-container,
    .success-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px 16px;
    }
    
    .loading-container ion-spinner,
    .error-container ion-icon,
    .success-container ion-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .error-container h3,
    .success-container h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
    }
    
    .error-container p,
    .success-container p {
      margin: 0 0 24px 0;
      color: var(--ion-color-medium);
      line-height: 1.5;
    }
    
    .password-requirements {
      background-color: rgba(var(--ion-color-medium-rgb), 0.1);
      border-radius: 8px;
      padding: 12px 16px;
      margin: 16px 0;
    }
    
    .password-requirements p {
      margin: 0 0 8px 0;
      font-weight: 500;
    }
    
    .password-requirements ul {
      margin: 0;
      padding-left: 24px;
    }
    
    .password-requirements li {
      margin-bottom: 4px;
      color: var(--ion-color-medium);
    }
    
    .password-requirements li.fulfilled {
      color: var(--ion-color-success);
    }
    
    .ion-invalid {
      --highlight-color: var(--ion-color-danger);
    }
  `
})
export class ResetPasswordConfirmPage implements OnInit {
  resetForm: FormGroup;
  isVerifying: boolean = true;
  isValidCode: boolean = false;
  isSubmitting: boolean = false;
  resetSuccess: boolean = false;
  email: string = '';
  actionCode: string = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.resetForm = this.formBuilder.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }
  
  ngOnInit(): void {
    // Extract the action code from URL
    this.route.queryParams.subscribe(params => {
      const oobCode = params['oobCode'];
      
      if (!oobCode) {
        this.isVerifying = false;
        this.isValidCode = false;
        return;
      }
      
      this.actionCode = oobCode;
      this.verifyActionCode(oobCode);
    });
  }
  
  verifyActionCode(oobCode: string): void {
    this.authService.verifyPasswordResetCode(oobCode)
      .then(email => {
        this.isVerifying = false;
        this.isValidCode = true;
        this.email = email;
      })
      .catch(error => {
        this.isVerifying = false;
        this.isValidCode = false;
        console.error('Invalid or expired reset code:', error);
      });
  }
  
  passwordValidator(control: FormControl): {[key: string]: any} | null {
    const value = control.value;
    
    // Check if password starts with capital letter
    const hasCapitalFirst = /^[A-Z]/.test(value);
    
    // Check if password contains at least one number
    const hasNumber = /[0-9]/.test(value);
    
    if (!hasCapitalFirst || !hasNumber) {
      return {
        passwordRequirements: {
          hasCapitalFirst: hasCapitalFirst,
          hasNumber: hasNumber
        }
      };
    }
    
    return null;
  }
  
  passwordMatchValidator(group: FormGroup): {[key: string]: any} | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
  
  // Validation helper methods
  isPasswordTooShort(): boolean {
    const control = this.resetForm.get('password');
    return control?.touched && control?.hasError('minlength') || false;
  }
  
  isPasswordMissingCapitalFirst(): boolean {
    const control = this.resetForm.get('password');
    return control?.touched && 
      control?.hasError('passwordRequirements') && 
      !control.errors?.['passwordRequirements'].hasCapitalFirst || false;
  }
  
  isPasswordMissingNumber(): boolean {
    const control = this.resetForm.get('password');
    return control?.touched && 
      control?.hasError('passwordRequirements') && 
      !control.errors?.['passwordRequirements'].hasNumber || false;
  }
  
  passwordsDontMatch(): boolean {
    return this.resetForm.hasError('passwordMismatch') && 
      this.resetForm.get('confirmPassword')?.touched || false;
  }
  
  onSubmit(): void {
    if (this.resetForm.invalid) {
      Object.keys(this.resetForm.controls).forEach(key => {
        const control = this.resetForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    const newPassword = this.resetForm.get('password')?.value;
    this.isSubmitting = true;
    
    this.authService.confirmPasswordReset(this.actionCode, newPassword)
      .then(() => {
        this.isSubmitting = false;
        this.resetSuccess = true;
      })
      .catch(error => {
        this.isSubmitting = false;
        
        // Handle specific errors
        if (error.code === 'auth/invalid-action-code') {
          this.showAlert('INVALID_RESET_LINK', 'RESET_LINK_EXPIRED');
        } else if (error.code === 'auth/weak-password') {
          this.showAlert('WEAK_PASSWORD', 'PASSWORD_TOO_WEAK');
        } else {
          this.showToast('PASSWORD_RESET_FAILED', 'danger');
        }
        
        console.error('Error resetting password:', error);
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