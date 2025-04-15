import { Component, OnInit } from '@angular/core';
import {  AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { FormsModule } from '@angular/forms';
import{IonItemOption,IonItemOptions,IonRefresher,IonRefresherContent,IonItemSliding,IonBadge,IonFabButton,IonMenuButton,IonSegmentButton,IonItem,IonLabel,IonHeader,IonTitle,IonButtons,IonIcon,IonContent,IonList,IonToolbar}from '@ionic/angular/standalone'

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [IonItemOption, IonItemOptions, IonRefresher, IonRefresherContent, IonItemSliding, IonBadge, IonFabButton, IonMenuButton, IonSegmentButton, CommonModule, RouterModule, TranslatePipe, FormsModule, IonItem, IonLabel, IonHeader, IonTitle, IonButtons, IonIcon, IonContent, IonList, IonToolbar],
  template: `<ion-header class="ion-no-border">
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-menu-button></ion-menu-button>
    </ion-buttons>
    <ion-title>{{ 'ADMIN_DASHBOARD' | translate }}</ion-title>
  </ion-toolbar>
  <ion-toolbar>
    <ion-segment [(ngModel)]="currentSegment" (ionChange)="segmentChanged()">
      <ion-segment-button value="pending">
        <ion-label>{{ 'PENDING_APPROVAL' | translate }}</ion-label>
      </ion-segment-button>
      <ion-segment-button value="all">
        <ion-label>{{ 'ALL_PRODUCTS' | translate }}</ion-label>
      </ion-segment-button>
    </ion-segment>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-refresher slot="fixed" (ionRefresh)="refreshProducts($event)">
    <ion-refresher-content></ion-refresher-content>
  </ion-refresher>

  <ng-container *ngIf="(filteredProducts$ | async) as products">
    <ion-list *ngIf="products.length > 0; else noProducts">
      <ion-item-sliding *ngFor="let product of products; let i = index" class="slide-in" [style.animation-delay]="(i * 0.05) + 's'">
        <ion-item [routerLink]="['/admin/products', product.id]">
          <ion-label>
            <h2>{{ product.name }}</h2>
            <p>{{ product.price }} ALL - {{ product.quantity }} {{ product.unit }}</p>
            <p>{{ 'CATEGORY' | translate }}: {{ product.category }}</p>
            <p>{{ 'FARMER_ID' | translate }}: {{ product.farmerId }}</p>
          </ion-label>
          <ion-badge slot="end" color="{{ product.approved ? 'success' : 'warning' }}">
            {{ product.approved ? ('APPROVED' | translate) : ('PENDING' | translate) }}
          </ion-badge>
        </ion-item>

        <ion-item-options side="end">
          <ion-item-option *ngIf="!product.approved" color="success" (click)="approveProduct(product); $event.stopPropagation()">
            <ion-icon slot="icon-only" name="checkmark"></ion-icon>
          </ion-item-option>
          <ion-item-option color="danger" (click)="deleteProduct(product); $event.stopPropagation()">
            <ion-icon slot="icon-only" name="trash"></ion-icon>
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    </ion-list>
  </ng-container>

  <ng-template #noProducts>
    <div class="empty-state fade-in">
      <ion-icon name="cube-outline"></ion-icon>
      <h3>{{ currentSegment === 'pending' ? ('NO_PENDING_PRODUCTS' | translate) : ('NO_PRODUCTS' | translate) }}</h3>
      <p>{{ currentSegment === 'pending' ? ('ALL_PRODUCTS_APPROVED' | translate) : ('NO_PRODUCTS_FOUND' | translate) }}</p>
    </div>
  </ng-template>

  <ion-fab vertical="bottom" horizontal="end" slot="fixed" routerLink="/admin/users">
    <ion-fab-button>
      <ion-icon name="people"></ion-icon>
    </ion-fab-button>
  </ion-fab>
</ion-content>`,
  styles: `
  ion-header {
    ion-toolbar {
      &:first-child {
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
      
      ion-segment {
        background: white;
        --background: white;
        
        ion-segment-button {
          --background-checked: rgba(var(--ion-color-primary-rgb), 0.1);
          --color-checked: white;
          --indicator-color: var(--ion-color-primary);
          --border-radius: var(--border-radius-md);
          font-family: 'Poppins', sans-serif;
          text-transform: none;
          font-weight: 500;
          letter-spacing: 0;
          
          &::part(indicator) {
            background: var(--ion-color-primary);
          }
          
          ion-label {
            font-size: 0.9rem;
          }
        }
      }
    }
  }
  
  ion-content {
    --background: var(--background-light);
  }
  
  ion-list {
    background: transparent;
    padding: var(--spacing-md) 0;
  }
  
  ion-item-sliding {
    margin-bottom: var(--spacing-sm);
    
    ion-item {
      --background: white;
      --border-radius: var(--border-radius-md);
      margin: 0 var(--spacing-md);
      box-shadow: var(--box-shadow-light);
      transition: var(--transition);
      
      &:hover {
        --background: rgba(var(--ion-color-light-rgb), 0.7);
      }
      
      ion-label {
        padding: var(--spacing-sm) 0;
        
        h2 {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--ion-color-dark);
          margin-bottom: 4px;
        }
        
        p {
          font-family: 'Poppins', sans-serif;
          margin: 2px 0;
          color: var(--ion-color-medium);
          font-size: 0.9rem;
          
          &:first-of-type {
            color: var(--ion-color-primary);
            font-weight: 500;
          }
        }
      }
      
      ion-note {
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        border-radius: 12px;
        padding: 4px 8px;
        text-transform: uppercase;
        font-size: 0.7rem;
        letter-spacing: 0.5px;
      }
    }
    
    ion-item-options {
      ion-item-option {
        border-radius: 0;
        
        &:first-child {
          border-top-left-radius: var(--border-radius-md);
          border-bottom-left-radius: var(--border-radius-md);
        }
        
        &:last-child {
          border-top-right-radius: var(--border-radius-md);
          border-bottom-right-radius: var(--border-radius-md);
        }
        
        ion-icon {
          font-size: 1.3rem;
        }
      }
    }
  }
  
  ion-fab-button {
    --background: var(--ion-color-primary);
    --box-shadow: var(--box-shadow-medium);
    transition: var(--transition);
    
    &::after {
      content: '';
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      background: rgba(var(--ion-color-primary-rgb), 0.1);
      border-radius: 50%;
      z-index: -1;
      opacity: 0;
      transform: scale(0.8);
      transition: var(--transition);
    }
    
    &:hover {
      --background: var(--ion-color-primary-shade);
      
      &::after {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
  
  .empty-state {
    padding: var(--spacing-xl) var(--spacing-md);
    text-align: center;
    color: var(--ion-color-medium);
    
    ion-icon {
      font-size: 64px;
      color: rgba(var(--ion-color-primary-rgb), 0.15);
      margin-bottom: var(--spacing-md);
    }
    
    h3 {
      font-family: 'Playfair Display', serif;
      margin: var(--spacing-sm) 0;
      color: var(--ion-color-dark);
      font-size: 1.4rem;
      font-weight: 600;
    }
    
    p {
      color: var(--ion-color-medium);
      max-width: 280px;
      margin: 0 auto var(--spacing-md);
      line-height: 1.5;
      font-family: 'Poppins', sans-serif;
    }
  }
  
  /* Animations */
  .fade-in {
    animation: fadeIn 0.8s ease-in-out;
  }
  
  .slide-in {
    animation: slideIn 0.5s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: translateX(-20px);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  /* Animation delays for list items */
  @for $i from 1 through 20 {
    ion-item-sliding:nth-child(#{$i}) {
      animation: slideIn 0.5s ease-out;
      animation-delay: #{$i * 0.05}s;
      animation-fill-mode: both;
    }
  }`
})
export class AdminDashboardPage implements OnInit {
  products$!: Observable<Product[]>;
  filteredProducts$!: Observable<Product[]>;
  currentSegment: 'pending' | 'all' = 'pending';

  constructor(
    private productService: ProductService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.products$ = this.productService.getAllProductsForAdmin();
    this.segmentChanged();
  }

  refreshProducts(event: any) {
    this.loadProducts();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  segmentChanged() {
    if (this.currentSegment === 'pending') {
      this.filteredProducts$ = this.products$.pipe(
        map(products => products.filter(product => !product.approved))
      );
    } else {
      this.filteredProducts$ = this.products$;
    }
  }

  async approveProduct(product: Product) {
    if (!product.id) return;
    
    const alert = await this.alertController.create({
      header: 'Confirm Approval',
      message: `Are you sure you want to approve "${product.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Approve',
          handler: () => {
            this.productService.approveProduct(product.id!).subscribe({
              next: () => {
                product.approved = true;
                this.showToast('Product approved successfully!', 'success');
                this.segmentChanged(); // Refresh the list
              },
              error: (error) => {
                console.error('Error approving product', error);
                this.showToast('Error approving product. Please try again.', 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteProduct(product: Product) {
    if (!product.id) return;
    
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.productService.deleteProduct(product.id!).subscribe({
              next: () => {
                this.showToast('Product deleted successfully!', 'success');
                this.loadProducts(); // Refresh the list
              },
              error: (error) => {
                console.error('Error deleting product', error);
                this.showToast('Error deleting product. Please try again.', 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });

    await toast.present();
  }
}