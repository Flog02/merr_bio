import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonTextarea, IonSelect, IonSelectModal, IonInput, IonNote, IonBackButton,
  IonItem, IonLabel, IonSelectOption, IonHeader, IonTitle, IonButton, IonGrid,
  IonButtons, IonContent, IonToolbar, IonSpinner, IonIcon, IonChip, IonRow, IonCol
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { FileUploadService } from '../../../services/file-upload.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';
import { switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslatePipe } from "../../../pipes/translate.pipe";

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    IonTextarea, IonSelect, IonInput, IonNote, IonBackButton, IonItem, IonLabel,
    IonSelectOption, IonHeader, IonTitle, IonButton, IonButtons, IonContent,
    IonToolbar, IonSpinner, IonIcon, IonChip, IonGrid, IonRow, IonCol,
    CommonModule, ReactiveFormsModule, TranslatePipe
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/farmer/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditMode ? ('EDIT_PRODUCT' | translate) : ('ADD_PRODUCT' | translate) }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <!-- Product Images Section -->
        <div class="image-upload-section">
          <h3>{{ 'PRODUCT_IMAGES' | translate }}</h3>
          
          <ion-grid>
            <ion-row>
              <!-- Existing Images Preview (Edit Mode) -->
              <ion-col size="4" *ngFor="let imageUrl of existingImages; let i = index">
                <div class="image-preview-container">
                  <img [src]="imageUrl" alt="Product image" class="product-image">
                  <div class="image-actions">
                    <ion-button fill="clear" color="danger" (click)="removeExistingImage(i)">
                      <ion-icon name="trash-outline"></ion-icon>
                    </ion-button>
                  </div>
                </div>
              </ion-col>
              
              <!-- New Images Preview -->
              <ion-col size="4" *ngFor="let image of selectedImages; let i = index">
                <div class="image-preview-container">
                  <img [src]="previewUrls[i]" alt="Product image preview" class="product-image">
                  <div class="image-actions">
                    <ion-button fill="clear" color="danger" (click)="removeSelectedImage(i)">
                      <ion-icon name="trash-outline"></ion-icon>
                    </ion-button>
                  </div>
                </div>
              </ion-col>
              
              <!-- Add Image Button -->
              <ion-col size="4" *ngIf="(existingImages.length + selectedImages.length) < maxImages">
                <div class="add-image-btn" (click)="imageFileInput.click()">
                  <ion-icon name="add-circle-outline"></ion-icon>
                  <span>{{ 'ADD_IMAGE' | translate }}</span>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
          
          <!-- Hidden file input -->
          <input 
            type="file"
            #imageFileInput
            multiple
            accept="image/*"
            style="display: none"
            (change)="onImagesSelected($event)"
          >
          
          <!-- Image upload guidance -->
          <p class="image-guidance">
            {{ 'IMAGE_GUIDANCE' | translate }}
          </p>
        </div>

        <ion-item>
          <ion-label position="floating">{{ 'PRODUCT_NAME' | translate }}</ion-label>
          <ion-input formControlName="name"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['name'].touched && errorControl['name'].errors?.['required']">
            {{ 'PRODUCT_REQUIRED' | translate }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'DESCRIPTION' | translate }}</ion-label>
          <ion-textarea rows="4" formControlName="description"></ion-textarea>
          <ion-note slot="error" *ngIf="errorControl['description'].touched && errorControl['description'].errors?.['required']">
            {{ 'DESCRIPTION_REQUIRED' | translate }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'CATEGORY' | translate }}</ion-label>
          <ion-select formControlName="category">
            <ion-select-option value="fruits">{{ 'FRUITS' | translate }}</ion-select-option>
            <ion-select-option value="vegetables">{{ 'VEGETABLES' | translate }}</ion-select-option>
            <ion-select-option value="dairy">{{ 'DAIRY' | translate }}</ion-select-option>
            <ion-select-option value="honey">{{ 'HONEY' | translate }}</ion-select-option>
            <ion-select-option value="wine">{{ 'WINE' | translate }}</ion-select-option>
            <ion-select-option value="oil">{{ 'OIL' | translate }}</ion-select-option>
            <ion-select-option value="other">{{ 'OTHER' | translate }}</ion-select-option>
          </ion-select>
          <ion-note slot="error" *ngIf="errorControl['category'].touched && errorControl['category'].errors?.['required']">
            {{ 'CATEGORY_REQUIRED' | translate }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'PRICE_ALL' | translate }}</ion-label>
          <ion-input type="number" formControlName="price"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['price'].touched && errorControl['price'].errors?.['required']">
            {{ 'PRICE_REQUIRED' | translate }}
          </ion-note>
          <ion-note slot="error" *ngIf="errorControl['price'].touched && errorControl['price'].errors?.['min']">
            {{ 'PRICE_MIN' | translate }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'QUANTITY' | translate }}</ion-label>
          <ion-input type="number" formControlName="quantity"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['quantity'].touched && errorControl['quantity'].errors?.['required']">
            {{ 'QUANTITY_REQUIRED' | translate }}
          </ion-note>
          <ion-note slot="error" *ngIf="errorControl['quantity'].touched && errorControl['quantity'].errors?.['min']">
            {{ 'QUANTITY_MIN' | translate }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'UNIT' | translate }}</ion-label>
          <ion-select formControlName="unit">
            <ion-select-option value="kg">{{ 'KG' | translate }}</ion-select-option>
            <ion-select-option value="liter">{{ 'LITER' | translate }}</ion-select-option>
            <ion-select-option value="piece">{{ 'PIECE' | translate }}</ion-select-option>
            <ion-select-option value="bunch">{{ 'BUNCH' | translate }}</ion-select-option>
          </ion-select>
          <ion-note slot="error" *ngIf="errorControl['unit'].touched && errorControl['unit'].errors?.['required']">
            {{ 'UNIT_REQUIRED' | translate }}
          </ion-note>
        </ion-item>

        <div class="submit-container">
          <ion-button expand="block" type="submit" [disabled]="!productForm.valid || isUploading" class="ion-margin-top">
            <ion-spinner *ngIf="isUploading" name="circles"></ion-spinner>
            <span *ngIf="!isUploading">
              {{ isEditMode ? ('UPDATE_PRODUCT' | translate) : ('ADD_PRODUCT' | translate) }}
            </span>
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: `
    .image-upload-section {
      margin-bottom: 24px;
      padding: 16px;
      background-color: var(--ion-color-light);
      border-radius: 8px;
      
      h3 {
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 18px;
        color: var(--ion-color-dark);
      }
    }
    
    .image-preview-container {
      position: relative;
      width: 100%;
      height: 120px;
      margin-bottom: 12px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      .product-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .image-actions {
        position: absolute;
        top: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 0 0 0 8px;
        
        ion-button {
          --padding-start: 4px;
          --padding-end: 4px;
          --padding-top: 4px;
          --padding-bottom: 4px;
          margin: 0;
          --color: white;
        }
      }
    }
    
    .add-image-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 120px;
      background-color: rgba(var(--ion-color-primary-rgb), 0.1);
      border: 2px dashed var(--ion-color-primary);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      ion-icon {
        font-size: 32px;
        color: var(--ion-color-primary);
        margin-bottom: 8px;
      }
      
      span {
        color: var(--ion-color-primary);
        font-size: 14px;
      }
      
      &:hover {
        background-color: rgba(var(--ion-color-primary-rgb), 0.2);
      }
    }
    
    .image-guidance {
      margin-top: 12px;
      font-size: 12px;
      color: var(--ion-color-medium);
      text-align: center;
    }
    
    .submit-container {
      margin-top: 32px;
      margin-bottom: 16px;
      
      ion-button {
        height: 48px;
        
        ion-spinner {
          margin-right: 8px;
        }
      }
    }
  `
})
export class ProductFormComponent implements OnInit {
  @ViewChild('imageFileInput') imageFileInput!: ElementRef<HTMLInputElement>;
  
  productForm!: FormGroup;
  isEditMode = false;
  productId: string = '';
  farmerId: string = '';
  isUploading = false;
  
  // Image handling
  maxImages = 5; // Maximum number of images allowed
  selectedImages: File[] = [];
  previewUrls: string[] = [];
  existingImages: string[] = [];
  imagesToRemove: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private fileUploadService: FileUploadService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
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
        
        // Store existing images
        if (product.images && product.images.length > 0) {
          this.existingImages = [...product.images];
        }
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
  
  /**
   * Handle image selection from file input
   */
  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      // Check if adding these would exceed max images
      const totalImagesCount = this.existingImages.length + this.selectedImages.length + input.files.length;
      
      if (totalImagesCount > this.maxImages) {
        alert(`You can upload a maximum of ${this.maxImages} images.`);
        input.value = ''; // Reset input
        return;
      }
      
      // Process the selected files
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        
        // Validate file type and size
        if (this.isValidImageFile(file)) {
          this.selectedImages.push(file);
          
          // Create preview URL
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target?.result) {
              this.previewUrls.push(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
    
    // Reset the input value to allow selecting the same file again
    input.value = '';
  }
  
  /**
   * Remove a selected image (not yet uploaded)
   */
  removeSelectedImage(index: number) {
    if (index >= 0 && index < this.selectedImages.length) {
      this.selectedImages.splice(index, 1);
      this.previewUrls.splice(index, 1);
    }
  }
  
  /**
   * Mark an existing image for removal (will be removed on submit)
   */
  removeExistingImage(index: number) {
    if (index >= 0 && index < this.existingImages.length) {
      // Add image URL to list of images to remove
      this.imagesToRemove.push(this.existingImages[index]);
      
      // Remove from existing images array
      this.existingImages.splice(index, 1);
    }
  }
  
  /**
   * Validate if the file is an image with acceptable format and size
   */
  private isValidImageFile(file: File): boolean {
    // Check file type
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!acceptedImageTypes.includes(file.type)) {
      alert('Invalid file type. Please select an image file (JPEG, PNG, GIF, WEBP).');
      return false;
    }
    
    // Check file size (limit to 2MB)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      alert('Image too large. Please select an image smaller than 2MB.');
      return false;
    }
    
    return true;
  }

  onSubmit() {
    if (this.productForm.invalid || !this.farmerId) {
      return;
    }

    this.isUploading = true;
    
    const productData: Partial<Product> = {
      ...this.productForm.value,
      farmerId: this.farmerId
    };

    // Handle existing images to be removed
    const deleteImageTasks = this.imagesToRemove.map(imageUrl => 
      this.fileUploadService.deleteFile(imageUrl)
    );

    // Create a function to process form submission after handling images
    const processSubmission = () => {
      if (this.isEditMode) {
        // Update existing product
        this.productService.updateProduct(
          this.productId, 
          productData, 
          this.selectedImages,
          this.existingImages.length === 0 // Replace images only if all existing ones were removed
        ).subscribe({
          next: () => {
            this.isUploading = false;
            this.router.navigate(['/farmer/dashboard']);
          },
          error: (error) => {
            this.isUploading = false;
            console.error('Error updating product', error);
            alert('Error updating product. Please try again.');
          }
        });
      } else {
        // Add new product
        const newProduct = {
          ...productData,
          createdAt: new Date(),
          approved: false
        } as Omit<Product, 'id'>;

        this.productService.addProduct(newProduct, this.selectedImages).subscribe({
          next: () => {
            this.isUploading = false;
            this.router.navigate(['/farmer/dashboard']);
          },
          error: (error) => {
            this.isUploading = false;
            console.error('Error adding product', error);
            alert('Error adding product. Please try again.');
          }
        });
      }
    };

    // If there are images to delete, do that first
    if (this.imagesToRemove.length > 0) {
      // Handle delete operations in parallel, then proceed
      Promise.all(deleteImageTasks.map(task => 
        new Promise(resolve => task.subscribe({
          next: () => resolve(true),
          error: err => {
            console.error('Error deleting image:', err);
            resolve(false);
          }
        }))
      )).then(() => {
        processSubmission();
      });
    } else {
      // Otherwise just proceed with form submission
      processSubmission();
    }
  }
}