import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="product-form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>
            <h2>
              <mat-icon color="primary">{{ isEdit ? 'edit' : 'add_box' }}</mat-icon>
              {{ isEdit ? 'Edit Product' : 'Create New Product' }}
            </h2>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="initialLoading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <form *ngIf="!initialLoading" [formGroup]="form" (ngSubmit)="onSubmit()" class="product-form">
            <!-- Name -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Product Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Smartphone Pro 15" (input)="onNameInput()">
              <mat-error *ngIf="form.get('name')?.hasError('required')">Product name is required</mat-error>
              <mat-error *ngIf="form.get('name')?.hasError('minlength')">Product name must be at least 2 characters</mat-error>
            </mat-form-field>

            <!-- Slug -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Product Slug</mat-label>
              <input matInput formControlName="slug" placeholder="e.g. smartphone-pro-15">
              <mat-error *ngIf="form.get('slug')?.hasError('required')">Product slug is required</mat-error>
            </mat-form-field>

            <!-- Category -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Category</mat-label>
              <mat-select formControlName="categoryId">
                <mat-option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="form.get('categoryId')?.hasError('required')">Category is required</mat-error>
            </mat-form-field>

            <!-- Price & Stock Row -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Price ($)</mat-label>
                <input matInput type="number" step="0.01" formControlName="price" placeholder="0.00">
                <mat-error *ngIf="form.get('price')?.hasError('required')">Price is required</mat-error>
                <mat-error *ngIf="form.get('price')?.hasError('min')">Price must be greater than 0</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Stock Quantity</mat-label>
                <input matInput type="number" formControlName="stock" placeholder="0">
                <mat-error *ngIf="form.get('stock')?.hasError('required')">Stock is required</mat-error>
                <mat-error *ngIf="form.get('stock')?.hasError('min')">Stock cannot be negative</mat-error>
              </mat-form-field>
            </div>

            <!-- Description -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Enter product details..."></textarea>
            </mat-form-field>

            <!-- Image URL -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Image URL</mat-label>
              <input matInput formControlName="imageUrl" placeholder="https://example.com/image.jpg">
            </mat-form-field>

            <!-- Active Status (Edit Mode) -->
            <div *ngIf="isEdit" class="toggle-container">
              <mat-slide-toggle formControlName="active" color="primary">
                Product Active Status
              </mat-slide-toggle>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting">
                <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
                {{ submitting ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product') }}
              </button>
              <button mat-button type="button" (click)="onCancel()" [disabled]="submitting">
                Cancel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .product-form-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 16px;
    }
    .form-card {
      padding: 16px;
    }
    mat-card-title h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
    .product-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }
    .full-width {
      width: 100%;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .half-width {
      flex: 1;
    }
    .toggle-container {
      margin: 8px 0 16px 0;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
  `]
})
export class ProductFormComponent implements OnInit {
  isEdit = false;
  productId: number | null = null;
  categories: Category[] = [];
  initialLoading = false;
  submitting = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      slug: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0.01)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      categoryId: [null, [Validators.required]],
      imageUrl: [''],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.productId = +idParam;
      this.loadProduct();
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories = res.data;
        }
      },
      error: () => this.notificationService.error('Failed to load categories')
    });
  }

  loadProduct(): void {
    if (!this.productId) return;
    this.initialLoading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (res) => {
        this.initialLoading = false;
        if (res.success && res.data) {
          this.form.patchValue({
            name: res.data.name,
            slug: res.data.slug,
            description: res.data.description,
            price: res.data.price,
            stock: res.data.stock,
            categoryId: res.data.categoryId,
            imageUrl: res.data.imageUrl,
            active: res.data.active
          });
        }
      },
      error: () => {
        this.initialLoading = false;
        this.notificationService.error('Failed to load product details');
        this.router.navigate(['/products']);
      }
    });
  }

  onNameInput(): void {
    if (!this.isEdit && (!this.form.get('slug')?.value || this.form.get('slug')?.pristine)) {
      const name = this.form.get('name')?.value || '';
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-');
      this.form.patchValue({ slug });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    const formValue = this.form.getRawValue();

    if (this.isEdit && this.productId) {
      this.productService.updateProduct(this.productId, formValue).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            this.notificationService.success('Product updated successfully');
            this.router.navigate(['/products']);
          }
        },
        error: (err) => {
          this.submitting = false;
          this.notificationService.error(err.error?.message || 'Failed to update product');
        }
      });
    } else {
      this.productService.createProduct(formValue).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            this.notificationService.success('Product created successfully');
            this.router.navigate(['/products']);
          }
        },
        error: (err) => {
          this.submitting = false;
          this.notificationService.error(err.error?.message || 'Failed to create product');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }
}
