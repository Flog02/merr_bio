import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router,RouterLink } from '@angular/router';
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
  imports: [RouterLink,CommonModule, TranslatePipe,IonCardTitle, IonSpinner, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonBackButton, IonImg, CommonModule, TranslatePipe, IonBadge, IonHeader, IonTitle, IonButton, IonButtons, IonIcon, IonContent, IonToolbar],
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
  <!-- Product Image Gallery -->
  <div class="product-image-gallery">
      <!-- When there are multiple images, show as gallery -->
      <div *ngIf="product.images && product.images.length > 0" class="gallery-container">
        <div class="main-image">
          <img [src]="currentImageUrl" alt="{{ product.name }}">
          
          <!-- Navigation arrows (only if multiple images) -->
          <div *ngIf="product.images.length > 1" class="gallery-navigation">
            <button class="nav-button prev" (click)="prevImage()">
              <ion-icon name="chevron-back"></ion-icon>
            </button>
            <button class="nav-button next" (click)="nextImage()">
              <ion-icon name="chevron-forward"></ion-icon>
            </button>
          </div>
          
          <!-- Image indicator dots -->
          <div *ngIf="product.images.length > 1" class="image-indicators">
            <span 
              *ngFor="let image of product.images; let i = index" 
              class="indicator-dot"
              [class.active]="i === currentImageIndex"
              (click)="setCurrentImage(i)">
            </span>
          </div>
        </div>
        
        <!-- Thumbnail strip (when more than 1 image) -->
        <div *ngIf="product.images.length > 1" class="thumbnail-strip">
          <div 
            *ngFor="let image of product.images; let i = index" 
            class="thumbnail"
            [class.active]="i === currentImageIndex"
            (click)="setCurrentImage(i)">
            <img [src]="image" alt="Thumbnail">
          </div>
        </div>
      </div>
      
      <!-- Fallback to placeholder if no images -->
      <div *ngIf="!product.images || product.images.length === 0" class="product-image">
        <img src="assets/product-placeholder.jpg" alt="{{ product.name }}">
      </div>
    </div>

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
     <ion-card-header class="card-header-with-icon">
  <ion-card-title>{{ 'FARMER_INFORMATION' | translate }}</ion-card-title>

</ion-card-header>
      <ion-card-content>
        <p><strong>{{ 'NAME' | translate }}:</strong> {{ farmer.displayName }}</p>
        <p><strong>{{ 'EMAIL' | translate }}:</strong> {{ farmer.email }}</p>
        <p><strong>{{ 'PHONE' | translate }}:</strong> {{ farmer.phoneNumber }}</p>
        <p><strong>{{ 'LOCATION' | translate }}:</strong> {{ farmer.location }}</p>
        <div [routerLink]="['/farmers/',farmer.uid]"   class="profile-check">
    {{ 'CHECK_PROFILE' | translate }}
    <ion-icon name="arrow-forward-outline"></ion-icon>
  </div>
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
  .product-image-gallery {
      width: 100%;
      height: 320px;
      position: relative;
      overflow: hidden;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
      }
      
      .gallery-container {
        width: 100%;
        height: 100%;
      }
      
      .main-image {
        width: 100%;
        height: 100%;
        position: relative;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition);
        }
        
        .gallery-navigation {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 var(--spacing-md);
          pointer-events: none;
          
          .nav-button {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.4);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            pointer-events: auto;
            transition: var(--transition);
            
            &:hover {
              background: rgba(0, 0, 0, 0.7);
            }
            
            ion-icon {
              font-size: 20px;
            }
          }
        }
        
        .image-indicators {
          position: absolute;
          bottom: var(--spacing-md);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 2;
          
          .indicator-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            transition: var(--transition);
            
            &.active {
              background: white;
              transform: scale(1.2);
            }
          }
        }
      }
      
      .thumbnail-strip {
        position: absolute;
        bottom: var(--spacing-sm);
        left: var(--spacing-md);
        right: var(--spacing-md);
        display: flex;
        gap: 8px;
        z-index: 2;
        overflow-x: auto;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
        
        &::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        
        .thumbnail {
          width: 48px;
          height: 48px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          transition: var(--transition);
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          &.active {
            border-color: white;
            transform: scale(1.1);
          }
          
          &:hover:not(.active) {
            border-color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }
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
    .profile-check{
      justify-self:end;
      cursor:pointer;
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
  currentImageIndex: number = 0;
  get currentImageUrl(): string {
    if (this.product?.images && this.product.images.length > 0) {
      return this.product.images[this.currentImageIndex];
    }
    return 'assets/product-placeholder.jpg';
  }
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private userService: UserService,
    private alertController: AlertController,
    private toastController: ToastController,

  ) {}

    // Image gallery navigation methods
    nextImage() {
      if (this.product?.images && this.currentImageIndex < this.product.images.length - 1) {
        this.currentImageIndex++;
      } else {
        this.currentImageIndex = 0; // Loop back to the first image
      }
    }
    
    prevImage() {
      if (this.product?.images && this.currentImageIndex > 0) {
        this.currentImageIndex--;
      } else if (this.product?.images) {
        this.currentImageIndex = this.product.images.length - 1; // Loop to the last image
      }
    }
    
    setCurrentImage(index: number) {
      if (this.product?.images && index >= 0 && index < this.product.images.length) {
        this.currentImageIndex = index;
      }
    }

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