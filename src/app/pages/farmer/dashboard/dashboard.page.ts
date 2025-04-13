// src/app/pages/farmer/dashboard/dashboard.page.ts
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { add, create, trash, checkmarkCircle, alertCircle } from 'ionicons/icons';
import {
  AlertController, LoadingController, ToastController,
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
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ 'FARMER_DASHBOARD' | translate }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="dashboard-header">
        <h1>{{ 'WELCOME_FARMER' | translate }}</h1>
        <p>{{ 'MANAGE_YOUR_PRODUCTS' | translate }}</p>
      </div>
      
      <div class="stats-cards">
        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <ion-card class="stat-card">
                <ion-card-content>
                  <div class="stat-value">{{ (products$ | async)?.length || 0 }}</div>
                  <div class="stat-label">{{ 'TOTAL_PRODUCTS' | translate }}</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card class="stat-card">
                <ion-card-content>
                  <div class="stat-value">{{ getPendingCount() }}</div>
                  <div class="stat-label">{{ 'PENDING_APPROVAL' | translate }}</div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
      
      <ion-searchbar placeholder="{{ 'SEARCH_PRODUCTS' | translate }}" animated></ion-searchbar>
      
      <div class="products-section">
        <div class="section-header">
          <h2>{{ 'MY_PRODUCTS' | translate }}</h2>
        </div>
        
        <ion-list lines="full">
          <ion-item-sliding *ngFor="let product of products$ | async">
            <ion-item [routerLink]="['/farmer/products', product.id]">
              <div class="product-image" slot="start">
                <img src="assets/product-placeholder.jpg" alt="{{ product.name }}">
              </div>
              <ion-label>
                <h2>{{ product.name }}</h2>
                <p>{{ product.price }} ALL - {{ product.quantity }} {{ product.unit }}</p>
                <p>{{ 'CATEGORY' | translate }}: {{ product.category }}</p>
              </ion-label>
              <ion-badge slot="end" color="{{ product.approved ? 'success' : 'warning' }}">
                {{ product.approved ? ('APPROVED' | translate) : ('PENDING' | translate) }}
              </ion-badge>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option color="primary" (click)="editProduct(product.id)">
                <ion-icon slot="icon-only" name="create"></ion-icon>
              </ion-item-option>
              <ion-item-option color="danger" (click)="deleteProduct(product.id)">
                <ion-icon slot="icon-only" name="trash"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
          
          <ion-item *ngIf="(products$ | async)?.length === 0">
            <ion-label class="ion-text-center">
              <p>{{ 'NO_PRODUCTS_YET' | translate }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
      
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button routerLink="/farmer/products/new">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .dashboard-header {
      padding: 20px;
      background-color: var(--ion-color-primary);
      color: white;
      
      h1 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 700;
      }
      
      p {
        margin: 0;
        font-size: 16px;
        opacity: 0.9;
      }
    }
    
    .stats-cards {
      margin-top: -20px;
      padding: 0 10px;
      
      .stat-card {
        border-radius: 12px;
        margin: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        
        ion-card-content {
          padding: 16px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--ion-color-primary);
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--ion-color-medium);
        }
      }
    }
    
    .section-header {
      padding: 0 20px;
      margin: 20px 0 10px;
      
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }
    
    .product-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    ion-item {
      --padding-start: 16px;
      --inner-padding-end: 16px;
      
      h2 {
        font-weight: 600;
        margin-bottom: 6px;
      }
      
      p {
        margin: 2px 0;
        font-size: 14px;
      }
    }
  `]
})
export class FarmerDashboardPage implements OnInit {
  products$!: Observable<Product[]>;
  pendingCount = 0;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
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

  async deleteProduct(id: any) {
    // Show confirmation dialog
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Deleting product...',
              spinner: 'circles'
            });
            await loading.present();
            
            this.productService.deleteProduct(id).subscribe({
              next: async () => {
                loading.dismiss();
                // Show success toast
                const toast = await this.toastController.create({
                  message: 'Product deleted successfully',
                  duration: 2000,
                  color: 'success',
                  position: 'bottom'
                });
                toast.present();
              },
              error: async (error) => {
                loading.dismiss();
                console.error('Error deleting product', error);
                // Show error toast
                const toast = await this.toastController.create({
                  message: 'Failed to delete product. Please try again.',
                  duration: 3000,
                  color: 'danger',
                  position: 'bottom'
                });
                toast.present();
              }
            });
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  getPendingCount(): number {
    return this.pendingCount;
  }
}