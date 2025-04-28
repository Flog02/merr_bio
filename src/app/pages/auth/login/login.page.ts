import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastController, ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { VerificationModalComponent } from 'src/app/components/verification-modal/verification-modal.component';
import { 
  IonSpinner,
  IonBackButton,
  IonItem,
  IonLabel,
  IonHeader,
  IonTitle,
  IonButton,
  IonButtons,
  IonIcon,
  IonContent,
  IonToolbar,
  IonInput,
  IonAlert
} from '@ionic/angular/standalone';
import { FormControl } from '@angular/forms/';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    TranslatePipe,
    IonBackButton, 
    IonItem, 
    IonLabel, 
    IonHeader, 
    IonTitle, 
    IonButton, 
    IonButtons, 
    IonIcon, 
    IonContent, 
    IonToolbar, 
    IonAlert,
    IonSpinner,
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    IonInput
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Login</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <!-- Email field with validation error -->
        <ion-item [class.ion-invalid]="isEmailInvalid()">
          <ion-label position="floating">Email</ion-label>
          <ion-input #emailInput type="email" formControlName="email"></ion-input>
        </ion-item>
        <div class="error-message" *ngIf="isEmailInvalid()">
          {{'Please_enter_a_valid_email_address'| translate}}
        </div>

        <!-- Password field -->
        <ion-item [class.ion-invalid]="isPasswordEmpty()">
          <ion-label position="floating">Password</ion-label>
          <ion-input #passwordInput type="password" formControlName="password"></ion-input>
        </ion-item>
        <div class="error-message" *ngIf="isPasswordEmpty()">
          {{'Password is required'| translate}}
        </div>

        <!-- Authentication error message -->
        <div class="auth-error" *ngIf="authError">
          <ion-icon name="alert-circle"></ion-icon>
          <span>{{ authError }}</span>
          
          <!-- Add verification options if the error is about email verification -->
          <div *ngIf="authError.includes('verify your email')" class="verification-actions">
            <ion-button fill="clear" size="small" (click)="resendVerificationEmail()">
              Resend Verification Email
            </ion-button>
            <ion-button fill="clear" size="small" (click)="openVerificationModal()">
              Check Verification Status
            </ion-button>
          </div>
        </div>

        <ion-button expand="block" type="submit" [disabled]="!loginForm.valid || isSubmitting" class="ion-margin-top">
          <ion-spinner *ngIf="isSubmitting" name="circles" class="submit-spinner"></ion-spinner>
          <span *ngIf="!isSubmitting">Login</span>
        </ion-button>
      </form>

      <div class="ion-text-center ion-padding-top">
        <p>{{"Don't have an account?"|translate}} <a routerLink="/register">Register</a></p>
      </div>
    </ion-content>
  `,
  styles: `
    .error-message {
      color: var(--ion-color-danger);
      font-size: 12px;
      margin: 5px 0 15px 16px;
    }

    ion-item.ion-invalid {
      --highlight-color: var(--ion-color-danger);
    }

    .auth-error {
      margin: 16px 0;
      padding: 12px;
      border-radius: 4px;
      background-color: rgba(var(--ion-color-danger-rgb), 0.1);
      color: var(--ion-color-danger);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .auth-error ion-icon {
      margin-right: 8px;
      font-size: 20px;
    }
    
    .verification-actions {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    
    .verification-actions ion-button {
      margin: 5px 0;
      --color: var(--ion-color-primary);
    }
    
    .submit-spinner {
      margin-right: 8px;
    }
  `
})
export class LoginPage {
  @ViewChild('emailInput') emailInput!: IonInput;
  @ViewChild('passwordInput') passwordInput!: IonInput;
  
  loginForm: FormGroup;
  authError: string | null = null;
  isSubmitting: boolean = false;
  
  // Store the temp credentials for verification purposes
  private tempEmail: string | null = null;
  private tempUser: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get errorControl() {
    return this.loginForm.controls;
  }

  // Simple validation check methods
  isEmailInvalid(): boolean {
    const control = this.loginForm.get('email');
    return control?.touched && (control?.hasError('required') || control?.hasError('email')) || false;
  }

  isPasswordEmpty(): boolean {
    const control = this.loginForm.get('password');
    return control?.touched && control?.hasError('required') || false;
  }

  // Focus the first invalid input
  focusFirstInvalidControl() {
    if (this.isEmailInvalid() && this.emailInput) {
      this.emailInput.setFocus();
      return;
    }
    
    if (this.isPasswordEmpty() && this.passwordInput) {
      this.passwordInput.setFocus();
      return;
    }
  }

  onSubmit() {
    // Reset auth error
    this.authError = null;
    
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      
      // Focus the first invalid input after a short delay
      setTimeout(() => this.focusFirstInvalidControl(), 100);
      
      return;
    }
  
    const { email, password } = this.loginForm.value;
    this.isSubmitting = true;
    this.tempEmail = email; // Store email for verification purposes
    
    this.authService.login(email, password).subscribe({
      next: (user) => {
        console.log('Login successful:', user);
        this.isSubmitting = false;
        this.showToast('Login successful!', 'success');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Login error', error);
        this.isSubmitting = false;
        
        // Handle specific authentication errors
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          this.authError = 'Invalid email or password';
        } else if (error.code === 'auth/invalid-email'|| error.code === 'auth/invalid-credential') {
          this.authError = 'Please enter a valid email address';
        } else if (error.code === 'auth/email-not-verified') {
          // Special handling for unverified email
          this.authError = 'Please verify your email address before logging in. Check your inbox for the verification link.';
          this.tempUser = this.authService.auth.currentUser; // Store user for verification actions
        } else {
          this.authError = 'Login failed. Please try again.';
        }
      }
    });
  }
  
  // Resend verification email
  async resendVerificationEmail() {
    if (!this.tempUser) {
      // Try to get current user
      this.tempUser = this.authService.auth.currentUser;
      
      if (!this.tempUser) {
        this.showToast('Unable to resend verification email. Please try logging in again.', 'danger');
        return;
      }
    }
    
    try {
      await this.authService.sendVerificationEmail(this.tempUser);
      this.showToast('Verification email has been resent. Please check your inbox.', 'success');
    } catch (error) {
      console.error('Error resending verification email:', error);
      this.showToast('Failed to resend verification email. Please try again later.', 'danger');
    }
  }
  
  // Open verification modal to check status
  async openVerificationModal() {
    if (!this.tempEmail) {
      this.tempEmail = this.loginForm.get('email')?.value;
      
      if (!this.tempEmail) {
        this.showToast('Please enter your email address first.', 'warning');
        return;
      }
    }
    
    const modal = await this.modalController.create({
      component: VerificationModalComponent,
      componentProps: { email: this.tempEmail },
      backdropDismiss: false,
      cssClass: 'verification-modal'
    });
    
    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    
    if (data?.verified) {
      // User has verified their email, try logging in again
      this.showToast('Email verified! You can now log in.', 'success');
      this.onSubmit(); // Resubmit the form
    }
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    
    await toast.present();
  }
}