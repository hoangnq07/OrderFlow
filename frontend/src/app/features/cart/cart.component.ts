import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { Cart, CartItem } from '../../core/models/cart.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CheckoutDialogComponent } from './checkout-dialog/checkout-dialog.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="cart-container">
      <div class="cart-header">
        <h1 class="page-title text-gradient-cyan">
          <mat-icon class="title-icon">shopping_cart</mat-icon> Shopping Cart
        </h1>
        <p class="page-subtitle">Review items, adjust quantities, and proceed to instant checkout</p>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="44"></mat-spinner>
      </div>

      <div *ngIf="!loading">
        <!-- Empty Cart State -->
        <div *ngIf="!cart || cart.items.length === 0" class="empty-cart-card glass-panel">
          <div class="empty-content">
            <div class="empty-icon-circle">
              <mat-icon class="empty-icon">remove_shopping_cart</mat-icon>
            </div>
            <h2>Your Shopping Cart is Empty</h2>
            <p>Discover our catalog items and add them to your cart with one click.</p>
            <a mat-raised-button class="btn-glowing" routerLink="/products">
              <mat-icon>storefront</mat-icon> Explore Storefront Catalog
            </a>
          </div>
        </div>

        <!-- Active Cart View -->
        <div *ngIf="cart && cart.items.length > 0" class="cart-layout">
          <!-- Cart Items List -->
          <div class="cart-items-section glass-panel">
            <table mat-table [dataSource]="cart.items" class="full-width">
              <!-- Image & Product -->
              <ng-container matColumnDef="image">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let item">
                  <div class="product-info">
                    <img [src]="item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'" (error)="onImageError($event)" [alt]="item.productName" class="item-thumb" />
                    <div>
                      <div class="product-name">{{ item.productName }}</div>
                      <div class="product-slug">{{ item.productSlug }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Unit Price -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Unit Price</th>
                <td mat-cell *matCellDef="let item" class="price-cell">
                  {{ item.unitPrice | currency:'USD':'symbol':'1.2-2' }}
                </td>
              </ng-container>

              <!-- Quantity Controls -->
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Quantity</th>
                <td mat-cell *matCellDef="let item">
                  <div class="quantity-controls">
                    <button mat-icon-button class="qty-btn" (click)="updateQuantity(item, item.quantity - 1)" [disabled]="actionLoading">
                      <mat-icon>remove</mat-icon>
                    </button>
                    <span class="quantity-value">{{ item.quantity }}</span>
                    <button mat-icon-button class="qty-btn" (click)="updateQuantity(item, item.quantity + 1)" [disabled]="actionLoading">
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <!-- Subtotal -->
              <ng-container matColumnDef="subtotal">
                <th mat-header-cell *matHeaderCellDef>Subtotal</th>
                <td mat-cell *matCellDef="let item" class="subtotal-cell text-gradient-cyan">
                  {{ item.subtotal | currency:'USD':'symbol':'1.2-2' }}
                </td>
              </ng-container>

              <!-- Actions -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="warn" (click)="removeItem(item)" [disabled]="actionLoading" title="Remove item">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <!-- Order Summary Sidebar -->
          <div class="cart-summary-section glass-panel">
            <h3 class="summary-title text-gradient-purple">Order Summary</h3>

            <div class="summary-content">
              <div class="summary-row">
                <span>Total Items:</span>
                <strong class="summary-val">{{ cart.totalItems }}</strong>
              </div>

              <div class="summary-row">
                <span>Shipping Fee:</span>
                <span class="free-shipping">FREE (INSTANT)</span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row total-row">
                <span>Total Amount:</span>
                <span class="total-amount text-gradient-cyan">{{ cart.totalAmount | currency:'USD':'symbol':'1.2-2' }}</span>
              </div>

              <div class="summary-actions">
                <button mat-raised-button class="btn-glowing checkout-btn" (click)="onCheckout()">
                  <mat-icon>payment</mat-icon> Proceed to Checkout
                </button>

                <button mat-outlined-button color="warn" class="clear-btn" (click)="onClearCart()" [disabled]="actionLoading">
                  <mat-icon>delete_sweep</mat-icon> Clear Shopping Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .cart-header {
      margin-bottom: 8px;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 2rem;
      font-weight: 800;
    }

    .title-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--accent-cyan);
    }

    .page-subtitle {
      margin: 4px 0 0 0;
      color: var(--text-muted);
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    /* Empty Cart State */
    .empty-cart-card {
      padding: 60px 24px;
      text-align: center;
    }

    .empty-icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px auto;
    }

    .empty-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--accent-pink);
    }

    .cart-layout {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .cart-items-section {
      flex: 3;
      min-width: 340px;
      padding: 16px;
      overflow-x: auto;
    }

    .product-info {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 8px 0;
    }

    .item-thumb {
      width: 54px;
      height: 54px;
      object-fit: cover;
      border-radius: 10px;
      border: 1px solid var(--glass-border);
    }

    .product-name {
      font-weight: 700;
      color: var(--text-main);
    }

    .product-slug {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .price-cell {
      font-weight: 600;
      color: var(--text-muted);
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .qty-btn {
      color: var(--accent-cyan);
      background: rgba(255, 255, 255, 0.05);
    }

    .quantity-value {
      font-weight: 800;
      min-width: 24px;
      text-align: center;
      font-size: 1rem;
    }

    .subtotal-cell {
      font-weight: 800;
      font-size: 1.1rem;
    }

    /* Summary Sidebar */
    .cart-summary-section {
      flex: 1;
      min-width: 300px;
      padding: 24px;
      height: fit-content;
    }

    .summary-title {
      margin: 0 0 20px 0;
      font-size: 1.25rem;
      font-weight: 800;
    }

    .summary-content {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-muted);
    }

    .summary-val {
      color: var(--text-main);
      font-size: 1.1rem;
    }

    .free-shipping {
      color: var(--accent-emerald);
      font-weight: 700;
      font-size: 0.85rem;
    }

    .summary-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 6px 0;
    }

    .total-row {
      font-size: 1.1rem;
      font-weight: 700;
    }

    .total-amount {
      font-size: 1.5rem;
      font-weight: 900;
    }

    .summary-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }

    .checkout-btn {
      width: 100%;
      height: 48px;
      font-size: 1rem !important;
    }

    .clear-btn {
      width: 100%;
      border-color: rgba(248, 113, 113, 0.4) !important;
    }
  `]
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;
  actionLoading = false;
  displayedColumns = ['image', 'price', 'quantity', 'subtotal', 'actions'];

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private notification: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.cart = res.data;
        }
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load shopping cart');
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 0) return;
    this.actionLoading = true;
    this.cartService.updateQuantity(item.productId, newQuantity).subscribe({
      next: (res) => {
        this.actionLoading = false;
        if (res.success && res.data) {
          this.cart = res.data;
        }
      },
      error: (err) => {
        this.actionLoading = false;
        this.notification.error(err.error?.message || 'Failed to update item quantity');
      }
    });
  }

  removeItem(item: CartItem): void {
    this.actionLoading = true;
    this.cartService.removeItem(item.productId).subscribe({
      next: () => {
        this.actionLoading = false;
        this.notification.success(`Removed "${item.productName}" from cart`);
        this.loadCart();
      },
      error: () => {
        this.actionLoading = false;
        this.notification.error('Failed to remove item');
      }
    });
  }

  onClearCart(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Clear Cart',
        message: 'Are you sure you want to remove all items from your shopping cart?'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.actionLoading = true;
        this.cartService.clearCart().subscribe({
          next: () => {
            this.actionLoading = false;
            this.notification.success('Shopping cart cleared');
            this.loadCart();
          },
          error: () => {
            this.actionLoading = false;
            this.notification.error('Failed to clear cart');
          }
        });
      }
    });
  }

  onCheckout(): void {
    if (!this.cart || this.cart.items.length === 0) return;

    const dialogRef = this.dialog.open(CheckoutDialogComponent, {
      width: '500px',
      data: { cart: this.cart }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.actionLoading = true;
        this.orderService.createOrder(result).subscribe({
          next: (res) => {
            this.actionLoading = false;
            this.notification.success(`Order #${res.data?.id || ''} placed successfully! Confirmation email has been dispatched.`);
            this.loadCart();
            this.router.navigate(['/orders']);
          },
          error: (err) => {
            this.actionLoading = false;
            this.notification.error(err.error?.message || 'Failed to place order. Please try again.');
          }
        });
      }
    });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
  }
}
