import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {  ModalController, LoadingController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product.model';
import { PurchaseRequestService } from 'src/app/services/purchase-request.service';
import { PurchaseRequest } from '../../../models/request.model';
import { Timestamp } from '@angular/fire/firestore';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import {IonInput,IonTextarea,IonNote,IonCardTitle,IonCard,IonCardContent,IonCardHeader,IonCardSubtitle,IonLabel,IonHeader,IonTitle,IonButton,IonButtons,IonIcon,IonContent,IonToolbar}from '@ionic/angular/standalone'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-purchase-request',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonInput,IonTextarea, IonNote, IonCardTitle, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonLabel, IonHeader, IonTitle, IonButton, IonButtons, IonIcon, IonContent, IonToolbar, CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `<ion-header class="ion-no-border">
  <ion-toolbar>
    <ion-title>{{ 'REQUEST_TO_PURCHASE' | translate }}</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="dismiss()">
        <ion-icon slot="icon-only" name="close-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding fade-in">
  <ion-card class="product-summary-card slide-up">
    <ion-card-header>
      <ion-card-title>{{ product.name }}</ion-card-title>
      <ion-card-subtitle>{{ 'PRODUCT_DETAILS' | translate }}</ion-card-subtitle>
    </ion-card-header>
    
    <ion-card-content>
      <div class="product-meta">
        <div class="meta-item">
          <ion-icon name="cube-outline"></ion-icon>
          <span>{{ 'AVAILABLE' | translate }}: <strong>{{ product.quantity }} {{ product.unit }}</strong></span>
        </div>
        <div class="meta-item">
          <ion-icon name="pricetag-outline"></ion-icon>
          <span>{{ 'PRICE' | translate }}: <strong>{{ product.price }} ALL {{ 'PER' | translate }} {{ product.unit }}</strong></span>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
  
  <ion-card class="form-card scale-in">
    <ion-card-header>
      <ion-card-title>
        <ion-icon name="cart-outline"></ion-icon>
        {{ 'YOUR_ORDER' | translate }}
      </ion-card-title>
    </ion-card-header>
    
    <ion-card-content>
      <form [formGroup]="requestForm" (ngSubmit)="onSubmit()">
        <div class="quantity-selector">
          <ion-label>{{ 'QUANTITY' | translate }} ({{ product.unit }})</ion-label>
          
          <div class="quantity-input">
            <ion-button fill="clear" (click)="decrementQuantity()" [disabled]="requestForm.get('quantity')?.value <= 1">
              <ion-icon name="remove-circle-outline"></ion-icon>
            </ion-button>
            
            <ion-input type="number" formControlName="quantity" inputmode="numeric" min="1" [max]="product.quantity"></ion-input>
            
            <ion-button fill="clear" (click)="incrementQuantity()" [disabled]="requestForm.get('quantity')?.value >= product.quantity">
              <ion-icon name="add-circle-outline"></ion-icon>
            </ion-button>
          </div>
          
          <ion-note class="error-message" *ngIf="requestForm.get('quantity')?.touched && requestForm.get('quantity')?.errors?.['required']">
            {{ 'QUANTITY_REQUIRED' | translate }}
          </ion-note>
          <ion-note class="error-message" *ngIf="requestForm.get('quantity')?.touched && requestForm.get('quantity')?.errors?.['min']">
            {{ 'QUANTITY_MIN_VALUE' | translate }}
          </ion-note>
          <ion-note class="error-message" *ngIf="requestForm.get('quantity')?.touched && requestForm.get('quantity')?.errors?.['max']">
            {{ 'CANNOT_EXCEED_AVAILABLE' | translate }}
          </ion-note>
        </div>
        
        <div class="order-summary" *ngIf="requestForm.get('quantity')?.valid">
          <div class="summary-item">
            <span>{{ 'TOTAL_QUANTITY' | translate }}</span>
            <strong>{{ requestForm.get('quantity')?.value }} {{ product.unit }}</strong>
          </div>
          <div class="summary-item">
            <span>{{ 'TOTAL_PRICE' | translate }}</span>
            <strong>{{ requestForm.get('quantity')?.value * product.price }} ALL</strong>
          </div>
        </div>
        
        <div class="message-area">
          <ion-label>{{ 'MESSAGE_TO_FARMER' | translate }} ({{ 'OPTIONAL' | translate }})</ion-label>
          <ion-textarea 
            formControlName="message" 
            rows="3" 
            placeholder="{{ 'MESSAGE_PLACEHOLDER' | translate }}"
            class="message-input">
          </ion-textarea>
        </div>
        
        <div class="button-group">
          <ion-button expand="block" fill="outline" (click)="dismiss()" class="button-outline">
            {{ 'CANCEL' | translate }}
          </ion-button>
          <ion-button expand="block" type="submit" [disabled]="!requestForm.valid" class="button-solid">
            <ion-icon slot="start" name="send-outline"></ion-icon>
            {{ 'SEND_REQUEST' | translate }}
          </ion-button>
        </div>
      </form>
    </ion-card-content>
  </ion-card>
</ion-content>`,
  styles: [`
    ion-header {
      ion-toolbar {
        --background: var(--ion-color-primary);
        --color: var(--text-light);
        
        ion-title {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          font-size: 1.2rem;
        }
        
        ion-button {
          --color: var(--text-light);
        }
      }
    }
    
    ion-content {
      --background: var(--background-light);
    }
    
    .product-summary-card {
      margin: var(--spacing-md);
      border-radius: var(--border-radius-md);
      box-shadow: var(--box-shadow-light);
      overflow: hidden;
      background: white;
      
      ion-card-header {
        padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
        
        ion-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: #222222;
        }
        
        ion-card-subtitle {
          font-size: 0.9rem;
          color: var(--ion-color-medium);
          font-family: 'Poppins', sans-serif;
          margin-top: 4px;
        }
      }
      
      ion-card-content {
        padding: var(--spacing-md);
      }
      
      .product-meta {
        .meta-item {
          display: flex;
          align-items: center;
          margin-bottom: var(--spacing-sm);
          font-family: 'Poppins', sans-serif;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          ion-icon {
            color: var(--ion-color-primary);
            font-size: 1.2rem;
            margin-right: var(--spacing-sm);
          }
          
          span {
            color: var(--ion-color-dark);
            font-size: 0.95rem;
            
            strong {
              font-weight: 600;
            }
          }
        }
      }
    }
    
    .form-card {
      margin: var(--spacing-md);
      border-radius: var(--border-radius-md);
      box-shadow: var(--box-shadow-light);
      background: white;
      
      ion-card-header {
        padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
        
        ion-card-title {
          display: flex;
          align-items: center;
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: #222222;
          
          ion-icon {
            margin-right: 10px;
            color: var(--ion-color-primary);
            font-size: 1.3rem;
          }
        }
      }
      
      ion-card-content {
        padding: var(--spacing-md);
      }
    }
    
    .quantity-selector {
      margin-bottom: var(--spacing-lg);
      
      ion-label {
        display: block;
        margin-bottom: var(--spacing-sm);
        font-weight: 500;
        color: var(--ion-color-dark);
        font-family: 'Poppins', sans-serif;
      }
      
      .quantity-input {
        display: flex;
        align-items: center;
        background: rgba(var(--ion-color-light-rgb), 0.7);
        border-radius: var(--border-radius-md);
        overflow: hidden;
        
        ion-button {
          --color: var(--ion-color-primary);
          margin: 0;
          height: 48px;
          
          ion-icon {
            font-size: 26px;
            transition: var(--transition);
          }
          
          &:active ion-icon {
            transform: scale(0.9);
          }
        }
        
        ion-input {
          --padding-start: 0;
          --padding-end: 0;
          text-align: center;
          font-weight: 600;
          font-size: 1.2rem;
          --background: transparent;
          width: 100%;
          max-width: 80px;
          font-family: 'Poppins', sans-serif;
        }
      }
      
      .error-message {
        color: var(--ion-color-danger);
        font-size: 0.8rem;
        display: block;
        margin-top: var(--spacing-xs);
        font-family: 'Poppins', sans-serif;
      }
    }
    
    .order-summary {
      background: rgba(var(--ion-color-primary-rgb), 0.05);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      
      .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-xs);
        font-size: 0.95rem;
        font-family: 'Poppins', sans-serif;
        
        &:last-child {
          margin-bottom: 0;
          padding-top: var(--spacing-sm);
          border-top: 1px solid rgba(var(--ion-color-primary-rgb), 0.1);
          
          strong {
            color: var(--ion-color-primary);
            font-size: 1.1rem;
          }
        }
        
        span {
          color: var(--ion-color-dark);
        }
        
        strong {
          font-weight: 600;
        }
      }
    }
    
    .message-area {
      margin-bottom: var(--spacing-lg);
      
      ion-label {
        display: block;
        margin-bottom: var(--spacing-sm);
        font-weight: 500;
        color: var(--ion-color-dark);
        font-family: 'Poppins', sans-serif;
      }
      
      .message-input {
        --background: rgba(var(--ion-color-light-rgb), 0.7);
        --padding-start: var(--spacing-md);
        --padding-end: var(--spacing-md);
        --padding-top: var(--spacing-sm);
        --border-radius: var(--border-radius-md);
        font-family: 'Poppins', sans-serif;
      }
    }
    
    .button-group {
      display: flex;
      gap: var(--spacing-md);
      
      ion-button {
        flex: 1;
        margin: 0;
        --border-radius: var(--border-radius-md);
        height: 48px;
        font-weight: 600;
        font-family: 'Poppins', sans-serif;
        letter-spacing: 0.3px;
        
        &.button-outline {
          --border-color: var(--ion-color-medium);
          --color: var(--ion-color-dark);
          
          &:hover {
            --border-color: var(--ion-color-primary);
            --color: var(--ion-color-primary);
          }
        }
        
        &.button-solid {
          --background: var(--ion-color-primary);
          
          &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0));
            opacity: 0;
            transition: var(--transition);
          }
          
          &:hover::before {
            opacity: 1;
          }
        }
      }
    }
    
    /* Animations */
    .fade-in {
      animation: fadeIn 0.8s ease-in-out;
    }
    
    .slide-up {
      animation: slideUp 0.6s ease-out;
    }
    
    .scale-in {
      animation: scaleIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }`]
})
export class PurchaseRequestComponent implements OnInit {
  @Input() product!: Product;
  @Input() customerId!: string;
  
  requestForm!: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    private purchaseRequestService: PurchaseRequestService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}
  
  ngOnInit() {
    this.requestForm = this.formBuilder.group({
      quantity: [1, [
        Validators.required, 
        Validators.min(1),
        Validators.max(this.product.quantity)
      ]],
      message: ['']
    });
  }
  
  incrementQuantity() {
    const currentValue = this.requestForm.get('quantity')?.value || 0;
    if (currentValue < this.product.quantity) {
      this.requestForm.patchValue({
        quantity: currentValue + 1
      });
    }
  }
  
  decrementQuantity() {
    const currentValue = this.requestForm.get('quantity')?.value || 0;
    if (currentValue > 1) {
      this.requestForm.patchValue({
        quantity: currentValue - 1
      });
    }
  }
  
  async onSubmit() {
    if (this.requestForm.invalid) {
      return;
    }
    
    const loading = await this.loadingController.create({
      message: 'Sending request...',
      spinner: 'dots'
    });
    await loading.present();
    
    const request: Omit<PurchaseRequest, "id"> = {
      productId: this.product.id!,
      customerId: this.customerId,
      farmerId: this.product.farmerId,
      quantity: this.requestForm.value.quantity,
      message: this.requestForm.value.message || `I would like to purchase ${this.requestForm.value.quantity} ${this.product.unit} of ${this.product.name}.`,
      status: 'pending' as 'pending',
      timestamp: Timestamp.fromDate(new Date())
    };
    
    this.purchaseRequestService.createRequest(request).subscribe({
      next: () => {
        loading.dismiss();
        this.showSuccessToast();
        this.dismiss({ success: true });
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error creating request', error);
        this.showErrorToast();
      }
    });
  }
  
  async showSuccessToast() {
    const toast = await this.toastController.create({
      message: 'Your request has been sent successfully!',
      duration: 3000,
      position: 'bottom',
      color: 'success',
      buttons: [
        {
          text: 'Done',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
  
  async showErrorToast() {
    const toast = await this.toastController.create({
      message: 'Error sending request. Please try again.',
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
  
  dismiss(data?: any) {
    this.modalController.dismiss(data);
  }
}