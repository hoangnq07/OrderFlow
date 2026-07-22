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
import { NotificationService } from '../../core/services/notification.service';
import { Cart, CartItem } from '../../core/models/cart.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

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
        <h2>
          <mat-icon color="primary">shopping_cart</mat-icon>
          Shopping Cart
        </h2>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading">
        <!-- Empty Cart State -->
        <div *ngIf="!cart || cart.items.length === 0" class="empty-cart-card">
          <mat-card class="empty-card">
            <mat-card-content class="empty-content">
              <mat-icon class="empty-icon">remove_shopping_cart</mat-icon>
              <h3>Your Shopping Cart is Empty</h3>
              <p>Looks like you haven't added any products to your cart yet.</p>
              <a mat-raised-button color="primary" routerLink="/products">
                <mat-icon>storefront</mat-icon> Browse Products
              </a>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Active Cart View -->
        <div *ngIf="cart && cart.items.length > 0" class="cart-layout">
          <!-- Cart Items List -->
          <div class="cart-items-section">
            <table mat-table [dataSource]="cart.items" class="full-width mat-elevation-z2">
              <!-- Image -->
              <ng-container matColumnDef="image">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let item">
                  <div class="product-info">
                    <img [src]="item.imageUrl || 'https://via.placeholder.com/50'" (error)="onImageError($event)" [alt]="item.productName" class="item-thumb" />
                    <div>
                      <span class="product-name">{{ item.productName }}</span>
                      <br />
                      <small class="product-slug">{{ item.productSlug }}</small>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Unit Price -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let item">
                  {{ item.unitPrice | currency:'USD':'symbol':'1.2-2' }}
                </td>
              </ng-container>

              <!-- Quantity Controls -->
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Quantity</th>
                <td mat-cell *matCellDef="let item">
                  <div class="quantity-controls">
                    <button mat-icon-button color="primary" (click)="updateQuantity(item, item.quantity - 1)" [disabled]="actionLoading">
                      <mat-icon>remove</mat-icon>
                    </button>
                    <span class="quantity-value">{{ item.quantity }}</span>
                    <button mat-icon-button color="primary" (click)="updateQuantity(item, item.quantity + 1)" [disabled]="actionLoading">
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <!-- Subtotal -->
              <ng-container matColumnDef="subtotal">
                <th mat-header-cell *matHeaderCellDef>Subtotal</th>
                <td mat-cell *matCellDef="let item" class="subtotal-cell">
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
          <div class="cart-summary-section">
            <mat-card class="summary-card">
              <mat-card-header>
                <mat-card-title>Order Summary</mat-card-title>
              </mat-card-header>
              <mat-card-content class="summary-content">
                <div class="summary-row">
                  <span>Total Items:</span>
                  <strong>{{ cart.totalItems }}</strong>
                </div>
                <div class="summary-row">
                  <span>Shipping:</span>
                  <span class="free-shipping">FREE</span>
                </div>
                <hr />
                <div class="summary-row total-row">
                  <span>Order Total:</span>
                  <span class="total-amount">{{ cart.totalAmount | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>

                <div class="summary-actions">
                  <button mat-raised-button color="primary" class="full-width checkout-btn" (click)="onCheckout()">
                    <mat-icon>payment</mat-icon> Proceed to Checkout
                  </button>
                  <button mat-outlined-button color="warn" class="full-width" (click)="onClearCart()" [disabled]="actionLoading">
                    <mat-icon>delete_sweep</mat-icon> Clear Cart
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 16px;
    }
    .cart-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .empty-card {
      text-align: center;
      padding: 48px 16px;
    }
    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #9e9e9e;
      margin-bottom: 16px;
    }
    .cart-layout {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    .cart-items-section {
      flex: 3;
      min-width: 320px;
    }
    .cart-summary-section {
      flex: 1;
      min-width: 280px;
    }
    .full-width {
      width: 100%;
    }
    .product-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 8px 0;
    }
    .item-thumb {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
    }
    .product-name {
      font-weight: 500;
    }
    .product-slug {
      color: #757575;
    }
    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .quantity-value {
      font-weight: 600;
      min-width: 24px;
      text-align: center;
    }
    .subtotal-cell {
      font-weight: 600;
    }
    .summary-card {
      padding: 16px;
    }
    .summary-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .free-shipping {
      color: #4caf50;
      font-weight: 600;
    }
    .total-row {
      font-size: 1.2rem;
      font-weight: 700;
    }
    .total-amount {
      color: #3f51b5;
    }
    .summary-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }
    .checkout-btn {
      padding: 8px 0;
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
    this.notification.info('Checkout functionality will be enabled in Epic 2 Order flow!');
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
  }
}
