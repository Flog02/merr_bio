import { Component, OnInit } from '@angular/core';
import { PurchaseRequestService } from 'src/app/services/purchase-request.service';
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
import { PurchaseRequest } from 'src/app/models/request.model';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonGrid,
    IonRow,
    IonCol,
    CommonModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonItem,
    IonLabel,
    IonSpinner
],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ (customer$ | async)?.displayName || 'Customer Profile' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ng-container *ngIf="(customer$ | async) as customer; else loading">
        <!-- Customer Profile Card -->
        <ion-card class="profile-card">
          <ion-card-content>
            <div class="profile-header">
              <div class="avatar-container">
                <img 
                  *ngIf="customer.profileImage" 
                  [src]="customer.profileImage" 
                  alt="{{ customer.displayName }}"
                  class="profile-avatar"
                >
                <ion-icon 
                  *ngIf="!customer.profileImage" 
                  name="person-circle" 
                  class="profile-avatar-icon"
                ></ion-icon>
              </div>
              <div class="customer-info">
                <h2 class="customer-name">{{ customer.displayName }}</h2>
                <div class="customer-badge">
                  <ion-badge color="success">{{ 'VERIFIED_CUSTOMER' | translate }}</ion-badge>
               
                </div>
              </div>
            </div>

            <div class="contact-details">
              <ion-item lines="none" *ngIf="customer.phoneNumber">
                <ion-icon name="call-outline" slot="start" color="primary"></ion-icon>
                <ion-label>{{ customer.phoneNumber }}</ion-label>
              </ion-item>
              
              <ion-item lines="none">
                <ion-icon name="mail-outline" slot="start" color="primary"></ion-icon>
                <ion-label>{{ customer.email }}</ion-label>
              </ion-item>
              
              <ion-item lines="none" *ngIf="customer.location">
                <ion-icon name="location-outline" slot="start" color="primary"></ion-icon>
                <ion-label>{{ customer.location }}</ion-label>
              </ion-item>
              
              <ion-item lines="none" *ngIf="customer.createdAt">
                <ion-icon name="calendar-outline" slot="start" color="primary"></ion-icon>
                <ion-label>{{ 'JOINED' | translate }}: {{ formatDate(customer.createdAt) }}</ion-label>
              </ion-item>
            </div>
            <div class="section-header">
          <h3>{{ 'CUSTOMER_REQUESTS' | translate }}</h3>
          <span *ngIf="(requests$ | async)?.length === 0">{{ 'NO_REQUESTS_YET' | translate }}</span>
          <!-- <span *ngIf="(products$  | async)?.length > 0">{{ (products$ | async)?.length }} {{ 'PRODUCTS' | translate }}</span> -->
          <span *ngIf="(requests$ | async) as requests">
  <ng-container *ngIf="requests && requests.length > 0">
    {{ requests.length }} {{ 'REQUESTS' | translate }}
  </ng-container>
</span>

        </div>

        <div class="products-container">
          <ng-container *ngIf="(requests$ | async) as requests">
            <ion-grid>
              <ion-row>
                <ion-col size="12" sizeSm="6" sizeMd="4" *ngFor="let requests of requests">
                  <ion-card class="product-card">
                    <div class="product-image-container">
                      <img 
                        [src]="requests.images && requests.images.length > 0 ? requests.images[0] : 'assets/product-placeholder.jpg'" 
                        
                        class="product-image"
                      >
                      <div class="product-status" *ngIf="requests.status=='pending'">
                        <ion-badge color="warning">{{ 'PENDING_APPROVAL' | translate }}</ion-badge>
                      </div>
                      <div class="product-status" *ngIf="requests.status=='accepted'">
                        <ion-badge color="warning">{{ 'APPROVED' | translate }}</ion-badge>
                      </div>
                      <div class="product-status" *ngIf="requests.status=='rejected'">
                        <ion-badge color="warning">{{ 'REJECTED' | translate }}</ion-badge>
                      </div>
                    </div>

                    <ion-card-header>
                      <ion-card-title>Request id: <div>{{ requests.productId }}</div></ion-card-title>
                      <ion-card-title>Farmer ID : <div>{{requests.farmerId}}</div></ion-card-title>
                
                      <ion-card-subtitle>Request quantity:{{ requests.quantity }}</ion-card-subtitle>

                    </ion-card-header>
                    <ion-card-content>
                        <div>
                        <p>
                         {{requests.message}}
                        </p>
                        </div>
        
                        <div> Date: {{requests.timestamp.toDate()| date:'short'}}
                        </div>
                        

                        <div style="justify-self: end; margin-top:10px" (click)="confirmdeleteRequest(requests)">
                        <ion-icon slot="icon-only" color="danger" name="trash"></ion-icon>
                        <span style="color: red;">Delete Request</span>
                        </div>
                    
                    </ion-card-content>
                    
                   
                    
                 
                  </ion-card>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ng-container>
        </div>
            <div class="action-buttons" *ngIf="currentUser$ | async as currentUser">
              <ion-button expand="block" fill="outline" *ngIf="currentUser.role === 'customer'" (click)="startChat(customer.uid)">
                <ion-icon name="chatbubble-outline" slot="start"></ion-icon>
                {{ 'MESSAGE_FARMER' | translate }}
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>


     
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
    
    .customer-info {
      flex: 1;
    }
    
    .customer-name {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 8px;
      color: var(--ion-color-dark);
    }
    
    .customer-badge {
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
export class CustomerPrivateProfilePage implements OnInit {
  customer$!: Observable<User | null>;
  currentUser$!: Observable<User | null>;
  isAdmin$!: Observable<boolean>;
  requests$!: Observable<PurchaseRequest[]>;
farmer$!:Observable<User | null>;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private purchaseService: PurchaseRequestService,
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
    this.customer$ = this.route.paramMap.pipe(
      switchMap(params => {
        const customerId = params.get('id');
        if (customerId) {
          return this.userService.getUserById(customerId);
        }
        return of(null);
      })
    );
    
      // Get the customer's requests
      this.requests$ = this.customer$.pipe(
        switchMap(customer => {
          if (customer && customer.uid) {
            return this.purchaseService.getRequestsByCustomer(customer.uid)
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
  
  startChat(customerId: string) {
    window.location.href = `/admin/chats/${customerId}`;
  }
  
  
  deleteRequest(requestId: string) {
    this.purchaseService.deleteRequest(requestId).subscribe({
      next: () => {
        this.showToast('Request deleted successfully', 'success');
        // Refresh the products list
        this.requests$ = this.customer$.pipe(
          switchMap(customer => {
            if (customer && customer.uid) {
              return this.purchaseService.getRequestsByCustomer(customer.uid)
            }
            return of([]);
          })
        );
      },
      error: (error) => {
        console.error('Error deleting request:', error);
        this.showToast('Failed to delete request', 'danger');
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
  async confirmdeleteRequest(requests: PurchaseRequest) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete ${requests.id}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteRequest(requests.id!);
          }
        }
      ]
    });
    
    await alert.present();
  }
 
  
  
  
 
}