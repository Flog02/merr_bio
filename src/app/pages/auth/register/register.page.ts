import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {  ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import {IonRadio,IonRadioGroup,IonListHeader,IonBackButton,IonItem,IonLabel,IonHeader,IonTitle,IonButton,IonButtons,IonContent,IonToolbar,IonInput}from '@ionic/angular/standalone'
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonRadio, IonRadioGroup, IonListHeader, IonBackButton, IonItem, IonLabel, IonHeader, IonTitle,IonInput ,IonButton, IonButtons, IonContent, IonToolbar, CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ 'REGISTER' | translate }}</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <!-- Email field with error message -->
        <ion-item [class.ion-invalid]="isEmailInvalid()">
          <ion-label position="floating">{{ 'EMAIL' | translate }}</ion-label>
          <ion-input #emailInput type="email" formControlName="email"></ion-input>
        </ion-item>
        <div class="error-message" *ngIf="isEmailInvalid()">
          {{ 'EMAIL_INVALID' | translate }}
        </div>

        <!-- Password field with error message -->
        <ion-item [class.ion-invalid]="isPasswordTooShort()">
          <ion-label position="floating">{{ 'PASSWORD' | translate }}</ion-label>
          <ion-input #passwordInput type="password" formControlName="password"></ion-input>
        </ion-item>
        <div class="error-message" *ngIf="isPasswordTooShort()">
          {{ 'PASSWORD_MIN_LENGTH' | translate }}
        </div>

        <!-- Other fields remain unchanged -->
        <ion-item>
          <ion-label position="floating">{{ 'NAME' | translate }}</ion-label>
          <ion-input type="text" formControlName="displayName"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'PHONE' | translate }}</ion-label>
          <ion-input type="tel" formControlName="phoneNumber"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'LOCATION' | translate }}</ion-label>
          <ion-input type="text" formControlName="location"></ion-input>
        </ion-item>

        <ion-radio-group formControlName="role">
          <ion-list-header>
            <ion-label>{{ 'ROLE' | translate }}</ion-label>
          </ion-list-header>

          <ion-item>
            <ion-label>{{ 'CUSTOMER' | translate }}</ion-label>
            <ion-radio slot="start" value="customer"></ion-radio>
          </ion-item>

          <ion-item>
            <ion-label>{{ 'FARMER' | translate }}</ion-label>
            <ion-radio slot="start" value="farmer"></ion-radio>
          </ion-item>
        </ion-radio-group>

        <ion-button expand="block" type="submit" [disabled]="!registerForm.valid" class="ion-margin-top">
          {{ 'REGISTER' | translate }}
        </ion-button>
      </form>

      <div class="ion-text-center ion-padding-top">
        <p>{{ 'ALREADY_HAVE_ACCOUNT' | translate }} <a routerLink="/login">{{ 'LOGIN' | translate }}</a></p>
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
  `
})
export class RegisterPage {
  @ViewChild('emailInput') emailInput!: IonInput;
  @ViewChild('passwordInput') passwordInput!: IonInput;
  
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', [Validators.required]],
      phoneNumber: [''],
      location: [''],
      role: ['customer', [Validators.required]]
    });
  }

  get errorControl() {
    return this.registerForm.controls;
  }

  // Simple methods to check specific validation errors
  isEmailInvalid(): boolean {
    const control = this.registerForm.get('email');
    return control?.touched && (control?.hasError('required') || control?.hasError('email')) || false;
  }

  isPasswordTooShort(): boolean {
    const control = this.registerForm.get('password');
    return control?.touched && control?.hasError('minlength') || false;
  }

  // Focus the first invalid input
  focusFirstInvalidControl() {
    if (this.isEmailInvalid() && this.emailInput) {
      this.emailInput.setFocus();
      return;
    }
    
    if (this.isPasswordTooShort() && this.passwordInput) {
      this.passwordInput.setFocus();
      return;
    }
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation error messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      
      // Focus the first invalid input
      setTimeout(() => this.focusFirstInvalidControl(), 100);
      
      // Show a toast with an error message
      const toast = await this.toastController.create({
        message: 'Please fix the form errors before submitting',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      
      await toast.present();
      return;
    }

    const { email, password, displayName, phoneNumber, location, role } = this.registerForm.value;

    this.authService.register(email, password, role, displayName, phoneNumber, location)
      .then(() => {
        // Successfully registered
        this.router.navigate(['/']);
      })
      .catch(error => {
        console.error('Registration error', error);
        // Handle registration error (show toast or alert)
        this.showErrorToast(error.message);
      });
  }
  
  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message || 'Registration failed. Please try again.',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    
    await toast.present();
  }
}