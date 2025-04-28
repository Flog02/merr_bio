import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, switchMap, combineLatest, of, map } from 'rxjs';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonBackButton, 
  IonButtons, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonButton, 
  IonIcon, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonBadge, 
  IonItem, 
  IonLabel, 
  IonAvatar, 
  IonSkeletonText,
  IonSpinner,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personCircle, 
  locationOutline, 
  callOutline, 
  mailOutline, 
  calendarOutline, 
  cartOutline, 
  chatbubbleOutline,
  trashOutline,
  createOutline,
  checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { User } from 'src/app/models/user.model';
import { Product } from 'src/app/models/product.model';
import { UserService } from 'src/app/services/user.service';
import { ProductService } from 'src/app/services/product.service';
import { AuthService } from 'src/app/services/auth.service';
import { TranslatePipe } from 'src/app/pipes/translate.pipe';

@Component({
  selector: 'app-farmer-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonItem,
    IonLabel,
    IonSpinner
],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/products"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ (farmer$ | async)?.displayName || 'Farmer Profile' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ng-container *ngIf="(farmer$ | async) as farmer; else loading">
        <!-- Farmer Profile Card -->
        <ion-card class="profile-card">
          <ion-card-content>
            <div class="profile-header">
              <div class="avatar-container">
                <img 
                  *ngIf="farmer.profileImage" 
                  [src]="farmer.profileImage" 
                  alt="{{ farmer.displayName }}"
                  class="profile-avatar"
                >
                <ion-icon 
                  *ngIf="!farmer.profileImage" 
                  name="person-circle" 
                  class="profile-avatar-icon"
                ></ion-icon>
              </div>
              <div class="farmer-info">
                <h2 class="farmer-name">{{ farmer.displayName }}</h2>
                <div class="farmer-badge">
                  <ion-badge color="success">{{ 'VERIFIED_FARMER' | translate }}</ion-badge>
                  <!-- <span *ngIf="farmer.phoneVerified" class="verified-badge">
                    <ion-icon name="checkmark-circle-outline"></ion-icon>
                    {{ 'PHONE_VERIFIED' | translate }}
                  </span> -->
                </div>
              </div>
            </div>

            <div class="contact-details">
              <ion-item lines="none" *ngIf="farmer.phoneNumber">
                <ion-icon name="call-outline" slot="start" color="primary"></ion-icon>
                <ion-label>{{ farmer.phoneNumber }}</ion-label>
              </ion-item>
              
              <ion-item lines="none">
                <ion-icon name="mail-outline" slot="start" color="primary"></ion-icon>
                <ion-label>{{ farmer.email }}</ion-label>
              </ion-item>
              
              <ion-item lines="none" *ngIf="farmer.location">
                <ion-icon name="location-outline" slot="start" color="primary"></ion-icon>
                <ion-label>{{ farmer.location }}</ion-label>
              </ion-item>
              
              <ion-item lines="none" *ngIf="farmer.createdAt">
                <ion-icon name="calendar-outline" slot="start" color="primary"></ion-icon>
                <ion-label>{{ 'JOINED' | translate }}: {{ formatDate(farmer.createdAt) }}</ion-label>
              </ion-item>
            </div>

            <div class="action-buttons" *ngIf="currentUser$ | async as currentUser">
              <ion-button expand="block" fill="outline" *ngIf="currentUser.role === 'customer'" (click)="startChat(farmer.uid)">
                <ion-icon name="chatbubble-outline" slot="start"></ion-icon>
                {{ 'MESSAGE_FARMER' | translate }}
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Products Section -->
        <div class="section-header">
          <h3>{{ 'FARMER_PRODUCTS' | translate }}</h3>
          <span *ngIf="(products$ | async)?.length === 0">{{ 'NO_PRODUCTS_YET' | translate }}</span>
          <!-- <span *ngIf="(products$  | async)?.length > 0">{{ (products$ | async)?.length }} {{ 'PRODUCTS' | translate }}</span> -->
          <span *ngIf="(products$ | async) as products">
  <ng-container *ngIf="products && products.length > 0">
    {{ products.length }} {{ 'PRODUCTS' | translate }}
  </ng-container>
</span>

        </div>

        <div class="products-container">
          <ng-container *ngIf="(products$ | async) as products">
            <ion-grid>
              <ion-row>
                <ion-col size="12" sizeSm="6" sizeMd="4" *ngFor="let product of products">
                  <ng-container *ngIf="product.approved">
                  <ion-card class="product-card" >
                    <div class="product-image-container">
                      <img 
                        [src]="product.images && product.images.length > 0 ? product.images[0] : 'assets/product-placeholder.jpg'" 
                        alt="{{ product.name }}"
                        class="product-image"
                      >
                      <div class="product-status" *ngIf="!product.approved">
                        <ion-badge color="warning">{{ 'PENDING_APPROVAL' | translate }}</ion-badge>
                      </div>
                    </div>
                    
                    <ion-card-header>
                      <ion-card-title>{{ product.name }}</ion-card-title>
                      <ion-card-subtitle>{{ product.price }} ALL / {{ product.unit }}</ion-card-subtitle>
                    </ion-card-header>
                    
                    <ion-card-content>
                      <p class="product-description">{{ product.description | slice:0:100 }}{{ product.description.length > 100 ? '...' : '' }}</p>
                      
                      <div class="product-footer">
                        <div class="product-availability">
                          {{ product.quantity }} {{ product.unit }} {{ 'AVAILABLE' | translate }}
                        </div>
                        
                        <div class="product-actions">
                          <ion-button fill="clear" size="small" [routerLink]="['/products', product.id]">
                            <ion-icon name="cart-outline" slot="start"></ion-icon>
                            {{ 'VIEW' | translate }}
                          </ion-button>
                          
                          <ion-button fill="clear" size="small" color="danger" *ngIf="isAdmin$ | async" (click)="confirmDeleteProduct(product)">
                            <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                          </ion-button>
                          
                          <ion-button fill="clear" size="small" color="success" *ngIf="(isAdmin$ | async) && !product.approved" (click)="approveProduct(product.id)">
                            <ion-icon name="checkmark-circle-outline" slot="icon-only"></ion-icon>
                          </ion-button>
                        </div>
                      </div>
                    </ion-card-content>
                  </ion-card>
                  </ng-container>
                 
                </ion-col>
              </ion-row>
            </ion-grid>
          </ng-container>
        </div>
      </ng-container>
      
      <ng-template #loading>
        <div class="loading-container">
          <ion-spinner></ion-spinner>
          <p>{{ 'LOADING_PROFILE' | translate }}</p>
        </div>
      </ng-template>
    </ion-content>
  `,
  styles: `
    .profile-card {
      margin: 16px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .profile-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .avatar-container {
      width: 80px;
      height: 80px;
      margin-right: 16px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid var(--ion-color-primary);
    }
    
    .profile-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .profile-avatar-icon {
      width: 100%;
      height: 100%;
      font-size: 80px;
      color: var(--ion-color-medium);
    }
    
    .farmer-info {
      flex: 1;
    }
    
    .farmer-name {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 8px;
      color: var(--ion-color-dark);
    }
    
    .farmer-badge {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .verified-badge {
      display: flex;
      align-items: center;
      font-size: 0.8rem;
      color: var(--ion-color-success);
      
      ion-icon {
        margin-right: 4px;
      }
    }
    
    .contact-details {
      margin-bottom: 24px;
      
      ion-item {
        --padding-start: 0;
        margin-bottom: 8px;
        
        ion-icon {
          font-size: 1.2rem;
          margin-right: 8px;
        }
      }
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 16px 0;
      
      h3 {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0;
        color: var(--ion-color-dark);
      }
      
      span {
        font-size: 0.9rem;
        color: var(--ion-color-medium);
      }
    }
    
    .products-container {
      padding: 8px;
    }
    
    .product-card {
      height: 100%;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
      
      &:hover {
        transform: translateY(-4px);
      }
    }
    
    .product-image-container {
      height: 160px;
      overflow: hidden;
      position: relative;
    }
    
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-status {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 10;
    }
    
    ion-card-header {
      padding-bottom: 8px;
    }
    
    ion-card-title {
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    ion-card-subtitle {
      font-size: 1rem;
      color: var(--ion-color-primary);
      font-weight: 600;
    }
    
    .product-description {
      color: var(--ion-color-medium);
      font-size: 0.9rem;
      margin-bottom: 16px;
      line-height: 1.4;
    }
    
    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--ion-color-light);
      padding-top: 8px;
    }
    
    .product-availability {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
    }
    
    .product-actions {
      display: flex;
      gap: 4px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
      
      ion-spinner {
        margin-bottom: 16px;
      }
      
      p {
        color: var(--ion-color-medium);
      }
    }
  `
})
export class FarmerPublicProfilePage implements OnInit {
  farmer$!: Observable<User | null>;
  products$!: Observable<Product[]>;
  currentUser$!: Observable<User | null>;
  isAdmin$!: Observable<boolean>;
  
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private productService: ProductService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ 
      personCircle, locationOutline, callOutline, mailOutline, calendarOutline, 
      cartOutline, chatbubbleOutline, trashOutline, createOutline,
      checkmarkCircleOutline, closeCircleOutline
    });
  }

  ngOnInit() {
    // Get the farmer ID from the route params
    this.farmer$ = this.route.paramMap.pipe(
      switchMap(params => {
        const farmerId = params.get('id');
        if (farmerId) {
          return this.userService.getUserById(farmerId);
        }
        return of(null);
      })
    );
    
    // Get the farmer's products
    this.products$ = this.farmer$.pipe(
      switchMap(farmer => {
        if (farmer && farmer.uid) {
          return this.productService.getProductsByFarmer(farmer.uid);
        }
        return of([]);
      })
    );
    
    // Get the current user
    this.currentUser$ = this.authService.user$;
    
    // Check if the current user is an admin
    this.isAdmin$ = this.currentUser$.pipe(
      map(user => user?.role === 'admin')
    );
  }
  
  formatDate(date: any): string {
    if (!date) return '';
    
    // Handle Firebase Timestamp objects
    if (date.toDate && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    
    // Handle Date objects or convert string to Date
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString();
  }
  
  startChat(farmerId: string) {
    // Navigate to chat with this farmer
    window.location.href = `/customer/chats/${farmerId}`;
  }
  
  async confirmDeleteProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete ${product.name}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteProduct(product.id!);
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  deleteProduct(productId: string) {
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.showToast('Product deleted successfully', 'success');
        // Refresh the products list
        this.products$ = this.farmer$.pipe(
          switchMap(farmer => {
            if (farmer && farmer.uid) {
              return this.productService.getProductsByFarmer(farmer.uid);
            }
            return of([]);
          })
        );
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.showToast('Failed to delete product', 'danger');
      }
    });
  }
  
  approveProduct(productId: any) {
    this.productService.approveProduct(productId).subscribe({
      next: () => {
        this.showToast('Product approved successfully', 'success');
        // Refresh the products list
        this.products$ = this.farmer$.pipe(
          switchMap(farmer => {
            if (farmer && farmer.uid) {
              return this.productService.getProductsByFarmer(farmer.uid);
            }
            return of([]);
          })
        );
      },
      error: (error) => {
        console.error('Error approving product:', error);
        this.showToast('Failed to approve product', 'danger');
      }
    });
  }
  
  async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    
    await toast.present();
  }
}