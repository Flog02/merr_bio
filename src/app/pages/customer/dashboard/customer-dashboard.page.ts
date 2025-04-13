import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  template: `<ion-header class="ion-no-border">
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-menu-button></ion-menu-button>
    </ion-buttons>
    <ion-title>{{ 'CUSTOMER_DASHBOARD' | translate }}</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div class="dashboard-header slide-up">
    <h1>{{ 'WELCOME_CUSTOMER' | translate }}</h1>
    <p>{{ 'CUSTOMER_DASHBOARD_DESCRIPTION' | translate }}</p>
  </div>
  
  <ion-grid>
    <ion-row>
      <ion-col size="12" size-md="6">
        <ion-card class="dashboard-card" routerLink="/products">
          <ion-card-header>
            <ion-card-title>{{ 'BROWSE_PRODUCTS' | translate }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-icon name="grid-outline" size="large"></ion-icon>
            <p>{{ 'BROWSE_PRODUCTS_DESCRIPTION' | translate }}</p>
          </ion-card-content>
        </ion-card>
      </ion-col>
      
      <ion-col size="12" size-md="6">
        <ion-card class="dashboard-card" routerLink="/customer/requests">
          <ion-card-header>
            <ion-card-title>{{ 'MY_REQUESTS' | translate }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-icon name="cart-outline" size="large"></ion-icon>
            <p>{{ 'VIEW_REQUESTS_DESCRIPTION' | translate }}</p>
          </ion-card-content>
        </ion-card>
      </ion-col>
    </ion-row>
    
    <ion-row>
      <ion-col size="12" size-md="6">
        <ion-card class="dashboard-card" routerLink="/chats">
          <ion-card-header>
            <ion-card-title>{{ 'MESSAGES' | translate }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-icon name="chatbubbles-outline" size="large"></ion-icon>
            <p>{{ 'MESSAGES_DESCRIPTION' | translate }}</p>
          </ion-card-content>
        </ion-card>
      </ion-col>
      
      <ion-col size="12" size-md="6">
        <ion-card class="dashboard-card" routerLink="/customer/profile">
          <ion-card-header>
            <ion-card-title>{{ 'MY_PROFILE' | translate }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-icon name="person-outline" size="large"></ion-icon>
            <p>{{ 'PROFILE_DESCRIPTION' | translate }}</p>
          </ion-card-content>
        </ion-card>
      </ion-col>
    </ion-row>
  </ion-grid>
</ion-content>`,
  styles: [`
    ion-header {
      ion-toolbar {
        --background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
        --color: white;
        
        ion-title {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
        }
        
        ion-menu-button {
          --color: white;
        }
      }
    }
    
    .dashboard-header {
      background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
      color: white;
      border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-lg);
      position: relative;
      overflow: hidden;
      
      /* Decorative elements */
      &::before, &::after {
        content: '';
        position: absolute;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
      }
      
      &::before {
        width: 120px;
        height: 120px;
        bottom: -60px;
        right: -20px;
      }
      
      &::after {
        width: 80px;
        height: 80px;
        top: -40px;
        left: 10%;
      }
      
      h1 {
        margin: 0 0 var(--spacing-xs);
        font-size: 1.8rem;
        font-weight: 700;
        color: white;
        font-family: 'Playfair Display', serif;
        position: relative;
        z-index: 2;
      }
      
      p {
        margin: 0;
        font-size: 1rem;
        opacity: 0.9;
        color: rgba(255, 255, 255, 0.9);
        font-family: 'Poppins', sans-serif;
        position: relative;
        z-index: 2;
        max-width: 600px;
        line-height: 1.6;
      }
    }
    
    .dashboard-card {
      margin: var(--spacing-sm);
      border-radius: var(--border-radius-md);
      overflow: hidden;
      box-shadow: var(--box-shadow-light);
      background: white;
      height: 100%;
      transition: var(--transition);
      cursor: pointer;
      
      &:hover {
        transform: translateY(-8px);
        box-shadow: var(--box-shadow-medium);
      }
      
      ion-card-header {
        padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
        background: rgba(var(--ion-color-light-rgb), 0.3);
        
        ion-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--ion-color-primary);
        }
      }
      
      ion-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: var(--spacing-md);
        
        ion-icon {
          font-size: 48px;
          margin: var(--spacing-md);
          color: var(--ion-color-primary);
          transition: var(--transition);
        }
        
        p {
          color: var(--ion-color-medium);
          font-family: 'Poppins', sans-serif;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }
      }
      
      &:hover ion-icon {
        transform: scale(1.1);
      }
      
      /* Card variants */
      &.primary-card {
        ion-card-header {
          background: var(--ion-color-primary);
          
          ion-card-title {
            color: white;
          }
        }
        
        ion-icon {
          color: var(--ion-color-primary);
        }
      }
    }
    
    /* Animations */
    .fade-in {
      animation: fadeIn 0.8s ease-in-out;
    }
    
    .slide-up {
      animation: slideUp 0.5s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { 
        transform: translateY(30px); 
        opacity: 0;
      }
      to { 
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    /* Animation delays for cards */
    @for $i from 1 through 4 {
      .dashboard-card:nth-child(#{$i}) {
        animation: slideUp 0.5s ease-out;
        animation-delay: #{0.2 + ($i * 0.1)}s;
        animation-fill-mode: both;
      }
    }
    
    /* Media Queries */
    @media (max-width: 768px) {
      .dashboard-header {
        padding: var(--spacing-md);
        
        h1 {
          font-size: 1.5rem;
        }
        
        p {
          font-size: 0.95rem;
        }
      }
    }`]
})
export class CustomerDashboardPage {
  constructor() {}
}