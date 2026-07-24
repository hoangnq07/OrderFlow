import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductResponse } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="product-page-container">
      <!-- Page Header -->
      <div class="product-header">
        <div>
          <span class="eyebrow">Storefront Collection</span>
          <h1 class="page-title text-gradient-cyan">Featured Storefront Catalog</h1>
          <p class="page-subtitle">Discover premium items crafted for seamless order processing</p>
        </div>
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="44"></mat-spinner>
        </div>
      }

      <!-- USER VIEW: 3D Floating Product Grid -->
      @if (!loading) {
        <div class="storefront-grid">
          @for (product of products; track product.id) {
            <div class="tilt-card-container">
              <div class="tilt-card glass-panel glass-panel-hover product-card">
                <div class="product-image-box">
                  <img [src]="product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'"
                       (error)="onImageError($event)" [alt]="product.name" class="product-img" />
                  <div class="category-pill-badge">{{ product.categoryName || 'General' }}</div>
                </div>

                <div class="product-info">
                  <h3 class="product-title">{{ product.name }}</h3>
                  <p class="product-slug-text">{{ product.slug }}</p>

                  <div class="price-stock-row">
                    <div class="price-tag text-gradient-cyan">
                      {{ product.price | currency:'USD':'symbol':'1.2-2' }}
                    </div>

                    <div class="stock-indicator" [class.in-stock]="product.stock > 0" [class.out-of-stock]="product.stock <= 0">
                      <mat-icon class="stock-icon">{{ product.stock > 0 ? 'check_circle' : 'cancel' }}</mat-icon>
                      <span>{{ product.stock > 0 ? product.stock + ' in stock' : 'Out of stock' }}</span>
                    </div>
                  </div>

                  <button 
                    mat-raised-button 
                    class="btn-glowing-purple add-cart-btn" 
                    (click)="onAddToCart(product)" 
                    [disabled]="!product.active || product.stock <= 0">
                    <mat-icon>shopping_bag</mat-icon> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="empty-state glass-panel">
              <mat-icon class="empty-icon">inventory</mat-icon>
              <h3>No products found in storefront</h3>
            </div>
          }
        </div>
      }

      <div class="pagination-wrapper glass-panel">
        <mat-paginator
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageIndex]="currentPage"
          [pageSizeOptions]="[8, 16, 32]"
          (page)="onPageChange($event)"
          showFirstLastButtons
        ></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .product-page-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .eyebrow {
      color: #38bdf8;
      font-size: .7rem;
      font-weight: 800;
      letter-spacing: .13em;
      text-transform: uppercase;
    }

    .page-title {
      margin: 4px 0 0 0;
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .page-subtitle {
      margin: 4px 0 0 0;
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    /* Storefront Grid & 3D Cards */
    .storefront-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .product-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
      box-sizing: border-box;
    }

    .product-image-box {
      position: relative;
      width: 100%;
      height: 200px;
      border-radius: 12px;
      overflow: hidden;
      background: rgba(0, 0, 0, 0.05);
    }

    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .product-card:hover .product-img {
      transform: scale(1.08);
    }

    .category-pill-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      color: var(--accent-cyan);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid rgba(0, 242, 254, 0.3);
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .product-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .product-slug-text {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .price-stock-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 12px;
    }

    .price-tag {
      font-size: 1.35rem;
      font-weight: 800;
    }

    .stock-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .stock-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .in-stock { color: var(--accent-emerald); }
    .out-of-stock { color: #f87171; }

    .add-cart-btn {
      width: 100%;
      margin-top: 12px;
    }

    .pagination-wrapper {
      padding: 8px 16px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .empty-state {
      grid-column: 1 / -1;
      padding: 60px;
      text-align: center;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--accent-cyan);
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: ProductResponse[] = [];
  totalElements = 0;
  pageSize = 8;
  currentPage = 0;
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notification: NotificationService
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
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
  }
}
