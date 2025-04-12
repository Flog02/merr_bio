// src/app/pages/farmer/dashboard/dashboard.page.ts
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { add, create, trash, checkmarkCircle, alertCircle } from 'ionicons/icons';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButtons,
  IonMenuButton,
  IonBadge,
  IonLabel,
  IonItem,
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonSkeletonText,
  IonFab,
  IonFabButton,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonButtons,
    IonMenuButton,
    IonBadge,
    IonLabel,
    IonItem,
    IonList,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonFab,
    IonFabButton,
    IonGrid,
    IonRow,
    IonCol,
    IonSearchbar
],
  template: `<ion-header class="ion-no-border">
  <ion-toolbar class="header-toolbar">
    <ion-buttons slot="start">
      <ion-menu-button color="light"></ion-menu-button>
    </ion-buttons>
    <ion-title color="light">{{ 'FARMER_DASHBOARD' | translate }}</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div class="dashboard-header slide-up">
    <h1>{{ 'WELCOME_FARMER' | translate }}</h1>
    <p>{{ 'MANAGE_YOUR_PRODUCTS' | translate }}</p>
  </div>
  
  <div class="stats-cards">
    <ion-grid>
      <ion-row>
        <ion-col size="6">
          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon">
                <ion-icon name="cube-outline"></ion-icon>
              </div>
              <div class="stat-value">{{ (products$ | async)?.length || 0 }}</div>
              <div class="stat-label">{{ 'TOTAL_PRODUCTS' | translate }}</div>
            </ion-card-content>
          </ion-card>
        </ion-col>
        <ion-col size="6">
          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon pending">
                <ion-icon name="time-outline"></ion-icon>
              </div>
              <div class="stat-value">{{ getPendingCount() }}</div>
              <div class="stat-label">{{ 'PENDING_APPROVAL' | translate }}</div>
            </ion-card-content>
          </ion-card>
        </ion-col>
      </ion-row>
    </ion-grid>
  </div>
  
  <ion-searchbar placeholder="{{ 'SEARCH_PRODUCTS' | translate }}" animated class="product-search fade-in"></ion-searchbar>
  
  <div class="products-section fade-in">
    <div class="section-header">
      <h2>{{ 'MY_PRODUCTS' | translate }}</h2>
      <ion-button fill="clear" size="small" routerLink="/farmer/products/new">
        <ion-icon slot="start" name="add-circle-outline"></ion-icon>
        {{ 'ADD_NEW' | translate }}
      </ion-button>
    </div>
    
    <ion-list lines="none">
      <ion-item-sliding *ngFor="let product of products$ | async; let i = index" class="slide-up" [style.animation-delay]="(i * 0.05) + 's'">
        <ion-item [routerLink]="['/farmer/products', product.id]" detail="false" class="product-item">
          <div class="product-image" slot="start">
            <img src="assets/images/product-placeholder.jpg" alt="{{ product.name }}">
          </div>
          <ion-label>
            <h2>{{ product.name }}</h2>
            <div class="product-price">{{ product.price }} ALL / {{ product.unit }}</div>
            <p class="product-meta">
              <span class="quantity">{{ product.quantity }} {{ product.unit }}</span>
              <span class="category">{{ product.category }}</span>
            </p>
          </ion-label>
          <ion-badge slot="end" color="{{ product.approved ? 'success' : 'warning' }}" class="status-badge">
            {{ product.approved ? ('APPROVED' | translate) : ('PENDING' | translate) }}
          </ion-badge>
        </ion-item>

        <ion-item-options side="end">
          <ion-item-option color="primary" (click)="editProduct(product.id)">
            <ion-icon slot="icon-only" name="create-outline"></ion-icon>
          </ion-item-option>
          <ion-item-option color="danger" (click)="deleteProduct(product.id)">
            <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
      
      <ion-item *ngIf="(products$ | async)?.length === 0" lines="none" class="no-products-item">
        <div class="no-products-message">
          <ion-icon name="leaf-outline"></ion-icon>
          <h3>{{ 'NO_PRODUCTS_YET' | translate }}</h3>
          <p>{{ 'ADD_FIRST_PRODUCT' | translate }}</p>
          <ion-button routerLink="/farmer/products/new" expand="block">
            <ion-icon slot="start" name="add-outline"></ion-icon>
            {{ 'ADD_PRODUCT' | translate }}
          </ion-button>
        </div>
      </ion-item>
    </ion-list>
  </div>
  
  <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="scale-in">
    <ion-fab-button routerLink="/farmer/products/new" color="primary">
      <ion-icon name="add"></ion-icon>
    </ion-fab-button>
  </ion-fab>
</ion-content>`,
  styles: [`/* Additional styles for farmer dashboard */

    /* Header styling */
    .header-toolbar {
      --background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-tint));
    }
    
    .dashboard-header {
      padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-xl);
      background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-tint));
      color: white;
      border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
      margin-bottom: calc(var(--spacing-xl) + var(--spacing-md));
      
      h1 {
        margin: 0 0 var(--spacing-xs);
        font-size: 1.6rem;
        font-weight: 700;
        color: white;
      }
      
      p {
        margin: 0;
        font-size: 1rem;
        opacity: 0.9;
        color: rgba(255, 255, 255, 0.9);
      }
    }
    
    /* Stats cards styling */
    .stats-cards {
      margin-top: calc(-1 * var(--spacing-xl));
      padding: 0 var(--spacing-md);
      position: relative;
      z-index: 10;
      
      .stat-card {
        border-radius: var(--border-radius-lg);
        margin: 0;
        box-shadow: var(--box-shadow-medium);
        background: white;
        transition: transform var(--transition-fast);
        
        &:hover {
          transform: translateY(-3px);
        }
        
        ion-card-content {
          padding: var(--spacing-md);
          text-align: center;
        }
        
        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: rgba(var(--ion-color-primary-rgb), 0.1);
          margin: 0 auto var(--spacing-sm);
          
          ion-icon {
            color: var(--ion-color-primary);
            font-size: 24px;
          }
          
          &.pending {
            background-color: rgba(var(--ion-color-warning-rgb), 0.1);
            
            ion-icon {
              color: var(--ion-color-warning);
            }
          }
        }
        
        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--ion-color-dark);
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: var(--ion-color-medium);
          font-weight: 500;
        }
      }
    }
    
    /* Product search */
    .product-search {
      margin: var(--spacing-md) var(--spacing-md) 0;
      --border-radius: var(--border-radius-lg);
      --background: white;
      --box-shadow: var(--box-shadow-soft);
      --placeholder-color: var(--ion-color-medium);
      --icon-color: var(--ion-color-primary);
    }
    
    /* Section header */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
      
      h2 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--ion-color-dark);
      }
      
      ion-button {
        --color: var(--ion-color-primary);
        font-weight: 500;
        
        ion-icon {
          margin-right: 4px;
        }
      }
    }
    
    /* Product item */
    .product-item {
      --background: white;
      margin: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--border-radius-md);
      box-shadow: var(--box-shadow-soft);
      --padding-start: 0;
      overflow: hidden;
      
      .product-image {
        width: 80px;
        height: 80px;
        margin: 0;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      ion-label {
        margin-left: var(--spacing-md);
        
        h2 {
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--ion-color-dark);
          font-size: 1rem;
        }
        
        .product-price {
          color: var(--ion-color-primary);
          font-weight: 700;
          font-size: 0.95rem;
          margin-bottom: 4px;
        }
        
        .product-meta {
          display: flex;
          font-size: 0.8rem;
          color: var(--ion-color-medium);
          margin: 4px 0 0;
          
          .quantity {
            margin-right: var(--spacing-md);
            display: flex;
            align-items: center;
            
            &:before {
              content: '';
              display: inline-block;
              width: 6px;
              height: 6px;
              background: var(--ion-color-medium);
              border-radius: 50%;
              margin-right: 4px;
              opacity: 0.6;
            }
          }
          
          .category {
            text-transform: capitalize;
            display: flex;
            align-items: center;
            
            &:before {
              content: '';
              display: inline-block;
              width: 6px;
              height: 6px;
              background: var(--ion-color-primary);
              border-radius: 50%;
              margin-right: 4px;
              opacity: 0.6;
            }
          }
        }
      }
      
      .status-badge {
        margin-right: var(--spacing-sm);
        padding: 6px 10px;
      }
    }
    
    /* No products message */
    .no-products-item {
      --background: transparent;
      --inner-padding-end: 0;
      
      .no-products-message {
        width: 100%;
        text-align: center;
        padding: var(--spacing-xl) var(--spacing-md);
        
        ion-icon {
          font-size: 64px;
          color: rgba(var(--ion-color-primary-rgb), 0.2);
          margin-bottom: var(--spacing-md);
        }
        
        h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--ion-color-dark);
          margin-bottom: var(--spacing-sm);
        }
        
        p {
          color: var(--ion-color-medium);
          margin-bottom: var(--spacing-lg);
          max-width: 300px;
          margin-left: auto;
          margin-right: auto;
        }
        
        ion-button {
          max-width: 250px;
          margin: 0 auto;
          --border-radius: var(--border-radius-md);
          height: 48px;
          font-weight: 600;
        }
      }
    }
    
    /* FAB button */
    ion-fab-button {
      --box-shadow: var(--box-shadow-medium);
      margin-bottom: var(--spacing-md);
    }`]
})
export class FarmerDashboardPage implements OnInit {
  products$!: Observable<Product[]>;
  pendingCount = 0;

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {
    addIcons({ add, create, trash, checkmarkCircle, alertCircle });
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.products$ = this.productService.getProductsByFarmer(user.uid);
        
        // Count pending products
        this.products$.subscribe(products => {
          this.pendingCount = products.filter(p => !p.approved).length;
        });
      }
    });
  }

  editProduct(id: any) {
    // Navigation handled by routerLink
  }

  deleteProduct(id: any) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        // Success - the list will update automatically
      },
      error: (error) => {
        console.error('Error deleting product', error);
        // Handle error
      }
    });
  }
  
  getPendingCount(): number {
    return this.pendingCount;
  }
}