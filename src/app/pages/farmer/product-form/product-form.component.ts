import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  IonicModule, 
  AlertController, 
  ToastController, 
  LoadingController 
} from '@ionic/angular';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/farmer/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditMode ? ('EDIT_PRODUCT' | translate) : ('ADD_PRODUCT' | translate) }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <div class="form-container">
          <div class="form-section">
            <ion-item class="form-item">
              <ion-label position="floating">{{ 'PRODUCT_NAME' | translate }}</ion-label>
              <ion-input formControlName="name" type="text"></ion-input>
            </ion-item>
            <div class="error-message" *ngIf="errorControl['name'].touched && errorControl['name'].errors?.['required']">
              {{ 'PRODUCT_NAME_REQUIRED' | translate }}
            </div>
          </div>

          <div class="form-section">
            <ion-item class="form-item">
              <ion-label position="floating">{{ 'DESCRIPTION' | translate }}</ion-label>
              <ion-textarea rows="4" formControlName="description"></ion-textarea>
            </ion-item>
            <div class="error-message" *ngIf="errorControl['description'].touched && errorControl['description'].errors?.['required']">
              {{ 'DESCRIPTION_REQUIRED' | translate }}
            </div>
          </div>

          <div class="form-section">
            <ion-item class="form-item">
              <ion-label position="floating">{{ 'CATEGORY' | translate }}</ion-label>
              <ion-select formControlName="category" interface="action-sheet" placeholder="{{ 'SELECT_CATEGORY' | translate }}">
                <ion-select-option value="fruits">{{ 'FRUITS' | translate }}</ion-select-option>
                <ion-select-option value="vegetables">{{ 'VEGETABLES' | translate }}</ion-select-option>
                <ion-select-option value="dairy">{{ 'DAIRY' | translate }}</ion-select-option>
                <ion-select-option value="honey">{{ 'HONEY' | translate }}</ion-select-option>
                <ion-select-option value="wine">{{ 'WINE' | translate }}</ion-select-option>
                <ion-select-option value="oil">{{ 'OIL' | translate }}</ion-select-option>
                <ion-select-option value="other">{{ 'OTHER' | translate }}</ion-select-option>
              </ion-select>
            </ion-item>
            <div class="error-message" *ngIf="errorControl['category'].touched && errorControl['category'].errors?.['required']">
              {{ 'CATEGORY_REQUIRED' | translate }}
            </div>
          </div>

          <div class="form-row">
            <div class="form-section">
              <ion-item class="form-item">
                <ion-label position="floating">{{ 'PRICE' | translate }} (ALL)</ion-label>
                <ion-input type="number" formControlName="price"></ion-input>
              </ion-item>
              <div class="error-message" *ngIf="errorControl['price'].touched && errorControl['price'].errors?.['required']">
                {{ 'PRICE_REQUIRED' | translate }}
              </div>
              <div class="error-message" *ngIf="errorControl['price'].touched && errorControl['price'].errors?.['min']">
                {{ 'PRICE_MIN_VALUE' | translate }}
              </div>
            </div>

            <div class="form-section">
              <ion-item class="form-item">
                <ion-label position="floating">{{ 'QUANTITY' | translate }}</ion-label>
                <ion-input type="number" formControlName="quantity"></ion-input>
              </ion-item>
              <div class="error-message" *ngIf="errorControl['quantity'].touched && errorControl['quantity'].errors?.['required']">
                {{ 'QUANTITY_REQUIRED' | translate }}
              </div>
              <div class="error-message" *ngIf="errorControl['quantity'].touched && errorControl['quantity'].errors?.['min']">
                {{ 'QUANTITY_MIN_VALUE' | translate }}
              </div>
            </div>
          </div>

          <div class="form-section">
            <ion-item class="form-item">
              <ion-label position="floating">{{ 'UNIT' | translate }}</ion-label>
              <ion-select formControlName="unit" interface="action-sheet" placeholder="{{ 'SELECT_UNIT' | translate }}">
                <ion-select-option value="kg">{{ 'KG' | translate }}</ion-select-option>
                <ion-select-option value="liter">{{ 'LITER' | translate }}</ion-select-option>
                <ion-select-option value="piece">{{ 'PIECE' | translate }}</ion-select-option>
                <ion-select-option value="bunch">{{ 'BUNCH' | translate }}</ion-select-option>
              </ion-select>
            </ion-item>
            <div class="error-message" *ngIf="errorControl['unit'].touched && errorControl['unit'].errors?.['required']">
              {{ 'UNIT_REQUIRED' | translate }}
            </div>
          </div>
        </div>
      </form>
      
      <!-- Fixed action button at bottom -->
      <div class="action-button">
        <ion-button expand="block" (click)="onSubmit()" [disabled]="!productForm.valid">
          {{ isEditMode ? ('UPDATE_PRODUCT' | translate) : ('ADD_PRODUCT' | translate) }}
        </ion-button>
      </div>
    </ion-content>
    
    <ion-footer class="ion-no-border"></ion-footer>
  `,
  styles: [`
    ion-content {
      --background: #f5f5f5;
    }
    
    .form-container {
      padding: var(--spacing-md);
      margin-bottom: calc(var(--spacing-md) * 2 + 48px); /* Space for the action button */
    }
    
    .form-section {
      margin-bottom: var(--spacing-md);
      
      .form-item {
        --background: white;
        --border-radius: var(--border-radius-md);
        --border-color: transparent;
        --highlight-color-focused: var(--ion-color-primary);
        box-shadow: var(--box-shadow-light);
        margin: 0;
      }
      
      .error-message {
        color: var(--ion-color-danger);
        font-size: 0.8rem;
        padding: var(--spacing-xs) var(--spacing-md);
      }
    }
    
    .form-row {
      display: flex;
      gap: var(--spacing-md);
      
      .form-section {
        flex: 1;
      }
    }
    
    .action-button {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: var(--spacing-md);
      box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.05);
      z-index: 10;
      
      ion-button {
        margin: 0;
        --border-radius: var(--border-radius-md);
        font-weight: 600;
        height: 48px;
      }
    }
    
    ion-footer {
      height: calc(var(--spacing-md) * 2 + 48px); /* Same as action button */
    }
  `]
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId: string = '';
  farmerId: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.createForm();

    this.authService.user$.subscribe(user => {
      if (user) {
        this.farmerId = user.uid;
      }
    });

    this.route.params.pipe(
      switchMap(params => {
        if (params['id'] && params['id'] !== 'new') {
          this.isEditMode = true;
          this.productId = params['id'];
          return this.productService.getProductById(this.productId);
        }
        return of(null);
      })
    ).subscribe(product => {
      if (product) {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          quantity: product.quantity,
          unit: product.unit
        });
      }
    });
  }

  createForm() {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(1)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unit: ['', [Validators.required]]
    });
  }

  get errorControl() {
    return this.productForm.controls;
  }

  async onSubmit() {
    if (this.productForm.invalid) {
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Updating product...' : 'Adding product...',
      spinner: 'dots'
    });
    await loading.present();

    try {
      if (this.isEditMode) {
        const productData: Partial<Product> = {
          ...this.productForm.value
        };

        this.productService.updateProduct(this.productId, productData).subscribe({
          next: () => {
            loading.dismiss();
            this.showSuccessToast(this.isEditMode ? 'Product updated successfully!' : 'Product added successfully!');
            this.router.navigate(['/farmer/dashboard']);
          },
          error: (error) => {
            loading.dismiss();
            console.error('Error updating product', error);
            this.showErrorAlert('Error updating product. Please try again.');
          }
        });
      } else {
        const newProduct = {
          ...this.productForm.value,
          farmerId: this.farmerId,
          createdAt: new Date(),
          approved: false
        } as Omit<Product, 'id'>;

        this.productService.addProduct(newProduct).subscribe({
          next: () => {
            loading.dismiss();
            this.showSuccessToast('Product added successfully!');
            this.router.navigate(['/farmer/dashboard']);
          },
          error: (error) => {
            loading.dismiss();
            console.error('Error adding product', error);
            this.showErrorAlert('Error adding product. Please try again.');
          }
        });
      }
    } catch (err) {
      loading.dismiss();
      this.showErrorAlert('An unexpected error occurred. Please try again.');
    }
  }

  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}