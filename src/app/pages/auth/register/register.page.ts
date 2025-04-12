import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, TranslatePipe],
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
        <ion-item>
          <ion-label position="floating">{{ 'EMAIL' | translate }}</ion-label>
          <ion-input type="email" formControlName="email"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['email'].touched && errorControl['email'].errors?.['required']">
            {{ 'EMAIL_REQUIRED' | translate }}
          </ion-note>
          <ion-note slot="error" *ngIf="errorControl['email'].touched && errorControl['email'].errors?.['email']">
            {{ 'EMAIL_INVALID' | translate }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'PASSWORD' | translate }}</ion-label>
          <ion-input type="password" formControlName="password"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['password'].touched && errorControl['password'].errors?.['required']">
            {{ 'PASSWORD_REQUIRED' | translate }}
          </ion-note>
          <ion-note slot="error" *ngIf="errorControl['password'].touched && errorControl['password'].errors?.['minlength']">
            {{ 'PASSWORD_MIN_LENGTH' | translate }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'NAME' | translate }}</ion-label>
          <ion-input type="text" formControlName="displayName"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['displayName'].touched && errorControl['displayName'].errors?.['required']">
            {{ 'NAME_REQUIRED' | translate }}
          </ion-note>
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
  `
})
export class RegisterPage {
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
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

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    const { email, password, displayName, phoneNumber, location, role } = this.registerForm.value;

    this.authService.register(email, password, role, displayName, phoneNumber, location)
    // phoneNumber, location
      .then(() => {
        // Successfully registered
        this.router.navigate(['/']);
      })
      .catch(error => {
        console.error('Registration error', error);
        // Handle registration error (show toast or alert)
      });
  }
}