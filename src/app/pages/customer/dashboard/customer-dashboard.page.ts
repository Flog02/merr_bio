// src/app/pages/customer/dashboard/customer-dashboard.page.ts
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
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ 'CUSTOMER_DASHBOARD' | translate }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-grid>
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>{{ 'WELCOME_CUSTOMER' | translate }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>{{ 'CUSTOMER_DASHBOARD_DESCRIPTION' | translate }}</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row>
          <ion-col size="12" size-md="6">
            <ion-card routerLink="/products">
              <ion-card-header>
                <ion-card-title>{{ 'BROWSE_PRODUCTS' | translate }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-icon name="list" size="large"></ion-icon>
                <p>{{ 'BROWSE_PRODUCTS_DESCRIPTION' | translate }}</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
          
          <ion-col size="12" size-md="6">
            <ion-card routerLink="/customer/requests">
              <ion-card-header>
                <ion-card-title>{{ 'MY_REQUESTS' | translate }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-icon name="cart" size="large"></ion-icon>
                <p>{{ 'VIEW_REQUESTS_DESCRIPTION' | translate }}</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>

        <ion-row>
          <ion-col size="12" size-md="6">
            <ion-card routerLink="/chats">
              <ion-card-header>
                <ion-card-title>{{ 'MESSAGES' | translate }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-icon name="chatbubbles" size="large"></ion-icon>
                <p>{{ 'MESSAGES_DESCRIPTION' | translate }}</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
          
          <ion-col size="12" size-md="6">
            <ion-card routerLink="/customer/profile">
              <ion-card-header>
                <ion-card-title>{{ 'MY_PROFILE' | translate }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-icon name="person" size="large"></ion-icon>
                <p>{{ 'PROFILE_DESCRIPTION' | translate }}</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [`
    ion-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    ion-icon {
      font-size: 48px;
      margin: 16px;
      color: var(--ion-color-primary);
    }
  `]
})
export class CustomerDashboardPage {
  constructor() {}
}