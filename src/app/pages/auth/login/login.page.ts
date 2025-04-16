import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {  ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import{IonBackButton,IonItem,IonLabel,IonHeader,IonTitle,IonButton,IonButtons,IonIcon,IonContent,IonToolbar,IonInput}from '@ionic/angular/standalone'
import { FormControl } from '@angular/forms/';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslatePipe,IonBackButton, IonItem, IonLabel, IonHeader, IonTitle, IonButton, IonButtons, IonIcon, IonContent, IonToolbar, CommonModule, ReactiveFormsModule, RouterModule,IonInput],
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
          Please enter a valid email address
        </div>

        <!-- Password field -->
        <ion-item [class.ion-invalid]="isPasswordEmpty()">
          <ion-label position="floating">Password</ion-label>
          <ion-input #passwordInput type="password" formControlName="password"></ion-input>
        </ion-item>
        <div class="error-message" *ngIf="isPasswordEmpty()">
          Password is required
        </div>

        <!-- Authentication error message -->
        <div class="auth-error" *ngIf="authError">
          <ion-icon name="alert-circle"></ion-icon>
          <span>{{ authError }}</span>
        </div>

        <ion-button expand="block" type="submit" [disabled]="!loginForm.valid" class="ion-margin-top">
          Login
        </ion-button>
      </form>

      <div class="ion-text-center ion-padding-top">
        <p>Don't have an account? <a routerLink="/register">Register</a></p>
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
      align-items: center;
    }

    .auth-error ion-icon {
      margin-right: 8px;
      font-size: 20px;
    }
  `
})
export class LoginPage {
  @ViewChild('emailInput') emailInput!: IonInput;
  @ViewChild('passwordInput') passwordInput!: IonInput;
  
  loginForm: FormGroup;
  authError: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    // private formControl : FormControl,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
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
    this.authService.login(email, password).subscribe({
      next: (user) => {
        console.log('Login successful:', user);
        this.showToast('Login successful!', 'success');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Login error', error);
        
        // Handle specific authentication errors
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          this.authError = 'Invalid email or password';
        } else if (error.code === 'auth/invalid-email') {
          this.authError = 'Please enter a valid email address';
        } else {
          this.authError = 'Login failed. Please try again.';
        }
      }
    });
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    
    await toast.present();
  }
}