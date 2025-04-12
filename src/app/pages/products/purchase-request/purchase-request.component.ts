import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, LoadingController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product.model';
import { PurchaseRequestService } from 'src/app/services/purchase-request.service';
import { PurchaseRequest } from '../../../models/request.model';
import { Timestamp } from '@angular/fire/firestore';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-purchase-request',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
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
              <ion-button expand="block" fill="outline" (click)="dismiss()">
                {{ 'CANCEL' | translate }}
              </ion-button>
              <ion-button expand="block" type="submit" [disabled]="!requestForm.valid">
                <ion-icon slot="start" name="send-outline"></ion-icon>
                {{ 'SEND_REQUEST' | translate }}
              </ion-button>
            </div>
          </form>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: var(--spacing-md);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--box-shadow-soft);
    }
    
    ion-card-header {
      padding-bottom: 0;
    }
    
    ion-card-title {
      display: flex;
      align-items: center;
      font-size: 1.2rem;
      
      ion-icon {
        margin-right: 8px;
        color: var(--ion-color-primary);
        font-size: 1.3rem;
      }
    }
    
    .product-meta {
      margin-top: var(--spacing-sm);
      
      .meta-item {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-sm);
        
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
    
    .quantity-selector {
      margin-bottom: var(--spacing-lg);
      
      ion-label {
        display: block;
        margin-bottom: var(--spacing-sm);
        font-weight: 500;
        color: var(--ion-color-dark);
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
          height: 46px;
          
          ion-icon {
            font-size: 24px;
          }
        }
        
        ion-input {
          --padding-start: 0;
          --padding-end: 0;
          text-align: center;
          font-weight: 600;
          font-size: 1.1rem;
          --background: transparent;
          width: 100%;
          max-width: 80px;
        }
      }
      
      .error-message {
        color: var(--ion-color-danger);
        font-size: 0.8rem;
        display: block;
        margin-top: var(--spacing-xs);
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
      }
      
      .message-input {
        --background: rgba(var(--ion-color-light-rgb), 0.7);
        --padding-start: var(--spacing-md);
        --padding-end: var(--spacing-md);
        --padding-top: var(--spacing-sm);
        --border-radius: var(--border-radius-md);
      }
    }
    
    .button-group {
      display: flex;
      gap: var(--spacing-md);
      
      ion-button {
        flex: 1;
        margin: 0;
        --border-radius: var(--border-radius-md);
        height: 46px;
        font-weight: 600;
      }
    }
  `]
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