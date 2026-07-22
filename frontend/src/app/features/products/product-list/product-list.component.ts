import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductResponse } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="product-header">
      <h2>Products Catalog</h2>
      <a mat-raised-button color="primary" routerLink="/products/new">
        <mat-icon>add</mat-icon> New Product
      </a>
    </div>

    @if (loading) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    }

    <table mat-table [dataSource]="products" class="full-width mat-elevation-z2">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>ID</th>
        <td mat-cell *matCellDef="let product">{{ product.id }}</td>
      </ng-container>

      <ng-container matColumnDef="imageUrl">
        <th mat-header-cell *matHeaderCellDef>Image</th>
        <td mat-cell *matCellDef="let product">
          <img [src]="product.imageUrl || 'https://via.placeholder.com/40'" (error)="onImageError($event)" alt="{{ product.name }}" class="product-thumb" />
        </td>
      </ng-container>

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let product">
          <span class="product-name">{{ product.name }}</span>
          <br />
          <small class="product-slug">{{ product.slug }}</small>
        </td>
      </ng-container>

      <ng-container matColumnDef="categoryName">
        <th mat-header-cell *matHeaderCellDef>Category</th>
        <td mat-cell *matCellDef="let product">{{ product.categoryName || 'N/A' }}</td>
      </ng-container>

      <ng-container matColumnDef="price">
        <th mat-header-cell *matHeaderCellDef>Price</th>
        <td mat-cell *matCellDef="let product">{{ product.price | currency:'USD':'symbol':'1.2-2' }}</td>
      </ng-container>

      <ng-container matColumnDef="stock">
        <th mat-header-cell *matHeaderCellDef>Stock</th>
        <td mat-cell *matCellDef="let product">{{ product.stock }}</td>
      </ng-container>

      <ng-container matColumnDef="active">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let product">
          <mat-chip [highlighted]="product.active">{{ product.active ? 'Active' : 'Inactive' }}</mat-chip>
        </td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let product">
          <button mat-icon-button color="accent" (click)="onAddToCart(product)" [disabled]="!product.active || product.stock <= 0" title="Add to Cart">
            <mat-icon>add_shopping_cart</mat-icon>
          </button>
          <a mat-icon-button [routerLink]="['/products', product.id, 'edit']" title="Edit Product">
            <mat-icon>edit</mat-icon>
          </a>
          <button mat-icon-button color="warn" (click)="onDelete(product)" title="Delete Product">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>

    <mat-paginator
      [length]="totalElements"
      [pageSize]="pageSize"
      [pageIndex]="currentPage"
      [pageSizeOptions]="[10, 20, 50]"
      (page)="onPageChange($event)"
      showFirstLastButtons
    ></mat-paginator>
  `,
  styles: [`
    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .full-width {
      width: 100%;
    }
    .product-thumb {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
      margin: 4px 0;
    }
    .product-name {
      font-weight: 500;
    }
    .product-slug {
      color: #757575;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 16px;
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: ProductResponse[] = [];
  displayedColumns = ['id', 'imageUrl', 'name', 'categoryName', 'price', 'stock', 'active', 'actions'];
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.products = res.data.content;
          this.totalElements = res.data.totalElements;
        }
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load product catalog');
      }
    });
  }

  onAddToCart(product: ProductResponse): void {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: (res) => {
        if (res.success) {
          this.notification.success(`Added "${product.name}" to shopping cart!`);
        }
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Failed to add product to cart');
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
  }

  onDelete(product: ProductResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete product "${product.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.notification.success('Product deleted successfully');
            if (this.products.length === 1 && this.currentPage > 0) {
              this.currentPage--;
            }
            this.loadProducts();
          },
          error: () => this.notification.error('Failed to delete product')
        });
      }
    });
  }
}
