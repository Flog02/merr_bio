import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import{IonCardTitle,IonSpinner,IonCard,IonCardContent,IonCardHeader,IonCardSubtitle,IonBackButton,IonImg,IonBadge,IonHeader,IonTitle,IonButton,IonButtons,IonIcon,IonContent,IonToolbar}from '@ionic/angular/standalone'

@Component({
  selector: 'app-admin-product-detail',
  standalone: true,
  imports: [CommonModule, TranslatePipe,IonCardTitle, IonSpinner, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonBackButton, IonImg, CommonModule, TranslatePipe, IonBadge, IonHeader, IonTitle, IonButton, IonButtons, IonIcon, IonContent, IonToolbar],
  template: `<ion-header class="ion-no-border">
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/admin/dashboard"></ion-back-button>
    </ion-buttons>
    <ion-title>{{ 'PRODUCT_DETAILS' | translate }}</ion-title>
    <ion-buttons slot="end" *ngIf="product">
      <ion-button *ngIf="!product.approved" (click)="approveProduct()" color="success">
        <ion-icon slot="icon-only" name="checkmark-circle-outline"></ion-icon>
      </ion-button>
      <ion-button (click)="deleteProduct()" color="danger">
        <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div *ngIf="product" class="fade-in">
    <ion-img 
      src="assets/product-placeholder.jpg" 
      alt="{{ product.name }}">
    </ion-img>

    <ion-card>
      <ion-card-header>
        <ion-card-title>{{ product.name }}</ion-card-title>
        <ion-card-subtitle>
          {{ product.price }} ALL per {{ product.unit }}
          <ion-badge color="{{ product.approved ? 'success' : 'warning' }}">
            {{ product.approved ? ('APPROVED' | translate) : ('PENDING' | translate) }}
          </ion-badge>
        </ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <p><strong>{{ 'DESCRIPTION' | translate }}:</strong> {{ product.description }}</p>
        <p><strong>{{ 'AVAILABILITY' | translate }}:</strong> {{ product.quantity }} {{ product.unit }}</p>
        <p><strong>{{ 'CATEGORY' | translate }}:</strong> {{ product.category }}</p>
        <p><strong>{{ 'CREATED_AT' | translate }}:</strong> {{ product.timestamp ? (product.timestamp.toDate() | date:'medium') : 'Not Available' }}</p>        </ion-card-content>
    </ion-card>

    <ion-card *ngIf="farmer">
      <ion-card-header>
        <ion-card-title>{{ 'FARMER_INFORMATION' | translate }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <p><strong>{{ 'NAME' | translate }}:</strong> {{ farmer.displayName }}</p>
        <p><strong>{{ 'EMAIL' | translate }}:</strong> {{ farmer.email }}</p>
        <p><strong>{{ 'PHONE' | translate }}:</strong> {{ farmer.phoneNumber }}</p>
        <p><strong>{{ 'LOCATION' | translate }}:</strong> {{ farmer.location }}</p>
      </ion-card-content>
    </ion-card>

    <div class="product-actions">
      <ion-button expand="block" class="approve-button" *ngIf="!product.approved" (click)="approveProduct()">
        <ion-icon slot="start" name="checkmark-circle-outline"></ion-icon>
        {{ 'APPROVE_PRODUCT' | translate }}
      </ion-button>
      <ion-button style="margin-top:10px; --background: var(--ion-color-danger);" expand="block" class="delete-button" (click)="deleteProduct()">
        <ion-icon slot="start" name="trash-outline"></ion-icon>
        {{ 'DELETE_PRODUCT' | translate }}
      </ion-button>
    </div>
    <div>
      
    </div>
  </div>
  
  <div *ngIf="!product" class="loading-container fade-in">
    <ion-spinner></ion-spinner>
    <p>{{ 'LOADING_PRODUCT_DETAILS' | translate }}</p>
  </div>
</ion-content>`,
  styles:`
  ion-header {
    ion-toolbar {
      --background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
      --color: white;
      
      ion-title {
        font-family: 'Playfair Display', serif;
        font-weight: 600;
      }
      
      ion-back-button {
        --color: white;
      }
    }
  }
  
  ion-content {
    --background: var(--background-light);
  }
  
  ion-img {
    height: 240px;
    object-fit: cover;
    border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
    margin-bottom: -10px;
    box-shadow: var(--box-shadow-light);
  }
  
  ion-card {
    margin: var(--spacing-lg) var(--spacing-md);
    border-radius: var(--border-radius-md);
    box-shadow: var(--box-shadow-medium);
    overflow: hidden;
    
    &:first-of-type {
      margin-top: 10px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
    
    ion-card-header {
      padding: var(--spacing-md) var(--spacing-md) 0;
      
      ion-card-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.4rem;
        font-weight: 600;
        margin-bottom: var(--spacing-xs);
        color: var(--ion-color-dark);
      }
      
      ion-card-subtitle {
        font-size: 1.1rem;
        color: var(--ion-color-primary);
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-xs);
      }
    }
    
    ion-card-content {
      padding: var(--spacing-md);
      
      p {
        margin: var(--spacing-xs) 0;
        font-family: 'Poppins', sans-serif;
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--ion-color-dark);
        
        strong {
          color: var(--ion-color-primary);
          font-weight: 600;
        }
      }
    }
    
    ion-badge {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
  
  
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    
    ion-spinner {
      width: 48px;
      height: 48px;
      margin-bottom: var(--spacing-md);
      color: var(--ion-color-primary);
    }
    
    p {
      color: var(--ion-color-medium);
      font-family: 'Poppins', sans-serif;
    }
  }
  
  /* Animations */
  .fade-in {
    animation: fadeIn 0.8s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }`
})
export class AdminProductDetailPage implements OnInit {
  product: Product | null = null;
  farmer: User | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private userService: UserService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadProductDetails();
  }

  loadProductDetails() {
    this.isLoading = true;
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (productId) {
      this.productService.getProductById(productId).subscribe({
        next: (product) => {
          this.product = product;
          
          // Load farmer info
          if (product.farmerId) {
            this.userService.getUserById(product.farmerId).subscribe({
              next: (farmer) => {
                this.farmer = farmer;
                this.isLoading = false;
              },
              error: (error) => {
                console.error('Error fetching farmer:', error);
                this.showToast('Error loading farmer details.', 'danger');
                this.isLoading = false;
              }
            });
          } else {
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error fetching product:', error);
          this.showToast('Error loading product details.', 'danger');
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  async approveProduct() {
    if (!this.product?.id) return;
    
    const alert = await this.alertController.create({
      header: 'Confirm Approval',
      message: 'Are you sure you want to approve this product?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Approve',
          handler: () => {
            this.isLoading = true;
            this.productService.approveProduct(this.product!.id!).subscribe({
              next: () => {
                this.product!.approved = true;
                this.showToast('Product approved successfully!', 'success');
                this.isLoading = false;
              },
              error: (error) => {
                console.error('Error approving product', error);
                this.showToast('Error approving product. Please try again.', 'danger');
                this.isLoading = false;
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteProduct() {
    if (!this.product?.id) return;
    
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
          handler: () => {
            this.isLoading = true;
            this.productService.deleteProduct(this.product!.id!).subscribe({
              next: () => {
                this.showToast('Product deleted successfully!', 'success');
                this.router.navigate(['/admin/dashboard']);
              },
              error: (error) => {
                console.error('Error deleting product', error);
                this.showToast('Error deleting product. Please try again.', 'danger');
                this.isLoading = false;
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