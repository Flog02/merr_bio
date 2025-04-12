import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input type="email" formControlName="email"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['email'].touched && errorControl['email'].errors?.['required']">
            Email is required
          </ion-note>
          <ion-note slot="error" *ngIf="errorControl['email'].touched && errorControl['email'].errors?.['email']">
            Please enter a valid email
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Password</ion-label>
          <ion-input type="password" formControlName="password"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['password'].touched && errorControl['password'].errors?.['required']">
            Password is required
          </ion-note>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="!loginForm.valid" class="ion-margin-top">
          Login
        </ion-button>
      </form>

      <div class="ion-text-center ion-padding-top">
        <p>Don't have an account? <a routerLink="/register">Register</a></p>
      </div>
    </ion-content>
  `
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get errorControl() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
  
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (user) => {
        // Navigation is now handled in the AuthService
        console.log('Login successful:', user);
      },
      error: (error) => {
        console.error('Login error', error);
        // Display error message to user
      }
    });
  }
}